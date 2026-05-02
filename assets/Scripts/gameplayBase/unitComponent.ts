import { _decorator, CCFloat, CCInteger, director, find, instantiate, Node, Prefab, Vec3 } from 'cc';
import { entityComponent } from './entityComponent';
import { enemiesManager } from './enemiesManager';
import { arrowComponent } from './arrowComponent';
import { enemyComponent, EnemyState } from './enemyComponent';
import { gameManager } from '../gameManager';
import { audioManager } from '../audioManager';

const { ccclass, property } = _decorator

export enum UnitState {alive, dead}

@ccclass('unitComponent')
export class unitComponent extends entityComponent {

    public state = UnitState.alive

    @property([CCInteger])
    public curCell: number[] = [-1, -1]

    @property(CCInteger)
    public lvl: number = 1
    
    public targetPosToMove: Vec3 = new Vec3()
    private tempPos: Vec3 = new Vec3()

    private enemManager: enemiesManager = null

    private tempDir = new Vec3()
    private tempEuler = new Vec3()

    @property(CCFloat)
    private turnSpeed = 5
    
    private targetEnemy: Node

    @property(Node)
    private shootPoint: Node = null

    @property(Prefab)
    private arrowPrefab: Prefab = null

    protected fakeStart() {

        const managerNode = find("enemiesManager")
        if (managerNode) {
            this.enemManager = managerNode.getComponent(enemiesManager)
        }

        this.schedule(() => this.findEnemy(), this.attackRate)
    }

    public setup(x: number, y: number, pos: Vec3) {
        this.curCell = [x, y]
        this.targetPosToMove = pos
    }

    
    protected update(dt: number): void {
        if (this.state === UnitState.dead || !this.enemManager) return

        if (!this.targetEnemy || (this.targetEnemy && this.targetEnemy.getComponent(enemyComponent).state === EnemyState.dead)) {
            this.targetEnemy = this.enemManager.returnNearestEnemyToEnd()
        }

        this.move(dt)
    }

    protected onDestroy(): void {
        if (this.targetEnemy) {
            this.targetEnemy.getComponent(enemyComponent).isPickedByUnit = false
        }
    }

    protected uniqueDamageEffect(): void {
        
    }

    move(dt: number) {
        

        Vec3.lerp(this.tempPos, this.node.getWorldPosition(), this.targetPosToMove, 10 * dt)
        this.node.setWorldPosition(this.tempPos)

        if (!this.targetEnemy) return

        Vec3.subtract(this.tempDir, this.targetEnemy.worldPosition, this.tempPos)

        const targetY = Math.atan2(-this.tempDir.x, -this.tempDir.z) * 180 / Math.PI
        const currentY = this.node.eulerAngles.y

        const t = Math.min(1, this.turnSpeed * dt)
        const diff = ((targetY - currentY + 540) % 360) - 180

        this.tempEuler.set(0, currentY + diff * t, 0)
        this.node.eulerAngles = this.tempEuler
    }

    attack(): void {
        if (!this.targetEnemy || this.state === UnitState.dead || !this.skel) return
        
        this.skel.crossFade("Attack")
    }

    onAttackFire() {
        if (this.state === UnitState.dead) return
        
        const arrow = instantiate(this.arrowPrefab)
        director.getScene().addChild(arrow)
        arrow.setWorldPosition(this.shootPoint.worldPosition)

        if (this.targetEnemy) {
            const enemyComp = this.targetEnemy.getComponent(enemyComponent)
            if (enemyComp) {
                arrow.getComponent(arrowComponent).setup(enemyComp, this.damage)
            }
        } else {
            arrow.destroy()
        }

        audioManager.play("bowShoot")
    }

    protected onAnimAttackEnd() {
        if(this.state != UnitState.dead){
            this.skel.crossFade("Idle", 0.2)
            this.state = UnitState.alive
        }
    }

    findEnemy(): void {
        if (this.targetEnemy && this.state === UnitState.alive && !gameManager.gameIsPaused) {
            this.attack()
        }
    }

    protected dead() {
        if (this.state === UnitState.dead) return

        this.state = UnitState.dead

        if (this.skel) {
            this.skel.crossFade("Death")
        }
        
        audioManager.play("unitDeath")
    }
}