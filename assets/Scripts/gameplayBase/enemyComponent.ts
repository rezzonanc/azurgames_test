import { _decorator, CCFloat, Color, Component, find, Material, MeshRenderer, Node, tween, Vec3 } from 'cc';
import { entityComponent } from './entityComponent';
import { EnemiesEvents, ENEMY_DIED, ENEMY_PASS } from './enemiesManager';
import { gridComponent } from './gridComponent';
import { unitComponent, UnitState } from './unitComponent';
import { gameManager } from '../gameManager';
import { progressBarComponent } from '../progressBarComponent';
import { audioManager } from '../audioManager';
const { ccclass, property } = _decorator;

export enum EnemyState {coming, attack, dead}

@ccclass('enemyComponent')
export class enemyComponent extends entityComponent {

    public state: EnemyState = EnemyState.coming

    private targetPosToMove = new Vec3()
    private tempDir = new Vec3()
    private tempPos = new Vec3()
    
    private step: number = 0
    
    private pointsArray: Node[] = []

    @property(CCFloat)
    private moveSpeed: number = 10

    private tempEuler = new Vec3()

    @property(Node)
    private modelNode: Node

    @property(CCFloat)
    private turnSpeed = 8

    @property(Node)
    public arrowTargetNode: Node

    public isPickedByUnit: boolean = false
    
    private gridManager: gridComponent = null

    @property([MeshRenderer])
    private meshes: MeshRenderer[] = []

    @property(Material)
    private transparentMat: Material

    private comingToUnit: boolean = false

    private unitTarget: unitComponent

    @property(CCFloat)
    private distToUnitToHit: number = 1

    private nearToUnit: boolean = false

    private hpPb: progressBarComponent

    protected fakeStart(){

        const managerNode = find("grid")
        if (managerNode) {
            this.gridManager = managerNode.getComponent(gridComponent)
        }
        
        this.hpPb = this.node.getChildByName("hpProgressBar").getComponent(progressBarComponent)

    }

    public setup(points: Node[], moveSpeed: number){
        this.pointsArray = points
        this.moveSpeed = moveSpeed
        this.findPath()
        
    }

    protected uniqueDamageEffect(){

        if(this.hp > 0){
            audioManager.play("orcHit")
        }

        this.hpPb.fill(((this.hp / this.maxHp)) * 100)
    }

    protected pause(): void {
        if(this.state != EnemyState.dead){
            this.skel.crossFade("Idle")
        }

    }

    protected unpause(): void {
        if(this.state != EnemyState.dead){
            this.skel.crossFade("Walk")
        }
    }

    protected update(dt: number) {
        this.move(dt)
    }

    findPath(){

        let targetNode: Node = null

        if(this.pointsArray[this.step]){
            targetNode =  this.pointsArray[this.step]
        }
        else{
            
            targetNode = this.gridManager.returnClosestUnit(this.node.worldPosition)
            
            if(targetNode && (!this.unitTarget || this.unitTarget.state === UnitState.dead)){
                this.unitTarget = targetNode.getComponent(unitComponent)
            }

            if(!this.comingToUnit){

                EnemiesEvents.emit(ENEMY_PASS)
                this.comingToUnit = true
                this.moveSpeed *= 1.4
                
                gameManager.redirect = true

            }
            
        }

        if(targetNode) this.targetPosToMove = targetNode.worldPosition.clone()

    }

    move(dt: number) {
        if(this.state != EnemyState.coming || gameManager.gameIsPaused) return

        this.node.getWorldPosition(this.tempPos)
        Vec3.subtract(this.tempDir, this.targetPosToMove, this.tempPos)

        const distance = this.tempDir.length()

        const targetY = Math.atan2(this.tempDir.x, this.tempDir.z) * 180 / Math.PI
        const currentY = this.modelNode.eulerAngles.y
        const t = Math.min(1, this.turnSpeed * dt)
        const diff = ((targetY - currentY + 360*1.5) % 360) - 180

        this.tempEuler.set(0, currentY + diff * t, 0)
        this.modelNode.eulerAngles = this.tempEuler

        const moveStep = this.moveSpeed * dt

        let distMultiplier = 1

        if(this.comingToUnit){
            distMultiplier = 1
        }

        if (moveStep >= distance * distMultiplier) {

            if(!this.comingToUnit){
                
                this.node.setWorldPosition(this.targetPosToMove)
                this.step++
                this.findPath()
                return
            }
        }
        if(this.comingToUnit){

            if(this.unitTarget && this.unitTarget.state != UnitState.alive){
                this.findPath()
            }

            if(distance <= this.distToUnitToHit){
                this.nearToUnit = true
                this.attack()
                return
            }
            
        }
        

        Vec3.normalize(this.tempDir, this.tempDir)
        Vec3.multiplyScalar(this.tempDir, this.tempDir, moveStep)
        Vec3.add(this.tempPos, this.tempPos, this.tempDir)
        this.node.setWorldPosition(this.tempPos)
    }

    attack(): void {
        if (!this.nearToUnit || !this.comingToUnit || !this.unitTarget || this.state != EnemyState.coming) return
        this.state = EnemyState.attack
        this.skel.crossFade("Attack")
    }

    public onAttackFire() {
        if (!this.comingToUnit || !this.unitTarget || this.state === EnemyState.dead) return
        this.unitTarget.takeDamage(this.damage)
        this.unitTarget = null
        this.nearToUnit = false
    }

    protected onAnimAttackEnd() {

        if(this.state != EnemyState.dead){

            this.state = EnemyState.coming

            this.findPath()

            if(this.unitTarget && this.unitTarget.state === UnitState.alive){
                this.skel.crossFade("Walk")
            }
            else{
                this.skel.crossFade("Idle")
            }

        }
        
    }

    protected dead(){

        if(this.state != EnemyState.dead){

            this.state = EnemyState.dead

            EnemiesEvents.emit(ENEMY_DIED, this.node.getWorldPosition())

            this.skel.crossFade("Death")
            
            this.node.getChildByName("model").getChildByName("shadow").destroy()
            this.hpPb.kill()

            audioManager.play("orcDeath")
            audioManager.play("cash")
        }
    }

    protected fade() {
        
        const mats = this.meshes.map(mesh => {
            mesh.setMaterialInstance(this.transparentMat, 0)
            return mesh.getMaterialInstance(0)
        })

        const tempColor = new Color(255, 255, 255, 255)
        const data = { alpha: 1 }

        tween(data)
        .to(0.3, { alpha: 0 }, {
            onUpdate: (target: any) => {
                tempColor.a = Math.floor(target.alpha * 255)
                for (let i = 0; i < mats.length; i++) {
                    if(mats[i]) {
                        mats[i].setProperty("albedo", tempColor)
                    }
                }
            }
        })
        .call(() => {
            this.node.active = false
        })
        .start()
    }

    
}


