import { _decorator, Component, Vec2, Camera, geometry, PhysicsSystem, Vec3, Node, CCFloat, clamp, BoxCollider } from 'cc';
import { InputEvents, INPUT_TOUCH_START, INPUT_TOUCH_MOVE, INPUT_TOUCH_END } from '../inputHandler';
import { gridComponent } from './gridComponent';
import { unitComponent } from './unitComponent';
import { cellComponent } from './cellComponent';
import { EnemiesEvents, ENEMY_PASS } from './enemiesManager';
import { GAME_PAUSED, GameEvents, gameManager } from '../gameManager';
import { audioManager } from '../audioManager';
const { ccclass, property } = _decorator;

@ccclass('controllUnitsOnGridComponent')
export class controllUnitsOnGridComponent extends Component {

    @property(Camera)
    private camera: Camera

    private ray: geometry.Ray = new geometry.Ray()

    private gridComp: gridComponent

    private unitDragged: unitComponent = null

    private dragTargetPos: Vec3

    @property(CCFloat)
    private yOffsetAboveFloor: number = 1

    private closestCellNode: Node
    private closestCell: cellComponent
    
    @property(Node)
    private floorColliderNode: Node
    private floorCollider: BoxCollider

    private merge: boolean = false
    private cellMergeComp: cellComponent

    private dragAllowed: boolean = true

    protected onLoad(): void {
        this.gridComp = this.node.getComponent(gridComponent)
        
    }

    protected start(): void {
        this.floorCollider = this.floorColliderNode.getComponent(BoxCollider)
    }

    protected onEnable(): void {
        
        InputEvents.on(INPUT_TOUCH_START, this.onTouchStart, this)
        InputEvents.on(INPUT_TOUCH_MOVE, this.onTouchMove, this)
        InputEvents.on(INPUT_TOUCH_END, this.onTouchEnd, this)

        EnemiesEvents.on(ENEMY_PASS, this.breakeDragg, this)
        GameEvents.on(GAME_PAUSED, this.drop, this)
    }

    protected onDisable(): void {
        InputEvents.off(INPUT_TOUCH_START, this.onTouchStart, this)
        InputEvents.off(INPUT_TOUCH_MOVE, this.onTouchMove, this)
        InputEvents.off(INPUT_TOUCH_END, this.onTouchEnd, this)

        EnemiesEvents.off(ENEMY_PASS, this.breakeDragg, this)
        GameEvents.off(GAME_PAUSED, this.drop, this)
    }

    private onTouchStart(state: string, pos: Vec2) {
        this.tryRaycast(pos, true)
    }

    private onTouchMove(state: string, pos: Vec2) {
        if (state !== 'drag') return
        this.tryRaycast(pos, true)
    }

    private onTouchEnd(state: string, pos: Vec2) {
        
        this.drop()
    }

    private drop(){
        if (this.merge && this.cellMergeComp && this.unitDragged) {
            this.gridComp.mergeUnits(this.unitDragged, this.cellMergeComp)
            audioManager.play("merge")
        }
        else if (this.closestCell && this.unitDragged) {
            audioManager.play("dropUnit")
            this.gridComp.placeUnitOnCell(this.unitDragged, this.closestCell)
        }

        this.merge = false
        this.cellMergeComp = null
        this.closestCell = null
        this.closestCellNode = null
        this.unitDragged = null
    }

    private breakeDragg(){
        
        if(!this.dragAllowed) return

        this.drop()

        InputEvents.off(INPUT_TOUCH_START, this.onTouchStart, this)
        InputEvents.off(INPUT_TOUCH_MOVE, this.onTouchMove, this)
        InputEvents.off(INPUT_TOUCH_END, this.onTouchEnd, this)

        EnemiesEvents.off(ENEMY_PASS, this.breakeDragg, this)

        this.dragAllowed = false
    }

    private tryRaycast(pos: Vec2, getUnit: boolean) {

        this.merge = false
        this.cellMergeComp = null

        if(!this.dragAllowed || gameManager.gameIsPaused) return
        
        this.camera.screenPointToRay(pos.x, pos.y, this.ray)

        if (PhysicsSystem.instance.raycast(this.ray)) {
            const hits = PhysicsSystem.instance.raycastResults

            if (hits.length === 0) return
            hits.sort((a, b) => a.distance - b.distance)

            let hitNode = hits[0].collider.node
            let hitPoint = hits[0].hitPoint
            
            const x = clamp(hitPoint.x, hitNode.worldPosition.x +  this.floorCollider.center.x -  this.floorCollider.size.x / 2, hitNode.worldPosition.x +  this.floorCollider.center.x +  this.floorCollider.size.x / 2,)
            const z = clamp(hitPoint.z, hitNode.worldPosition.z +  this.floorCollider.center.z -  this.floorCollider.size.z / 2, hitNode.worldPosition.z +  this.floorCollider.center.z +  this.floorCollider.size.z / 2,)
            
            this.dragTargetPos = new Vec3(x, this.yOffsetAboveFloor, z)

            let cellComp = hitNode.getComponent(cellComponent)

            try {
                cellComp = hitNode.getComponent(cellComponent)
            } catch (error) { }

            if (cellComp) {

                if (!this.unitDragged && getUnit) {
                    this.setUnitDrag(hitNode)
                    
                }

                const isCellFree = this.gridComp.checkCellIsFree(cellComp.id[0], cellComp.id[1])
                const isItsOwnCell = this.unitDragged && this.unitDragged.curCell[0] === cellComp.id[0] && this.unitDragged.curCell[1] === cellComp.id[1]
                const isSameUnit = this.unitDragged && this.gridComp.grid[cellComp.id[0]][cellComp.id[1]] === this.gridComp.grid[this.unitDragged.curCell[0]][this.unitDragged.curCell[1]]
                
                if (isCellFree || isItsOwnCell) {
                    if (this.closestCell !== cellComp) {
                        this.closestCellNode = hitNode
                        this.closestCell = cellComp
                    }
                }
                else if (!isItsOwnCell && isSameUnit){
                    if(this.gridComp.mergeIsPossible(this.unitDragged, cellComp)){
                        this.merge = true
                        this.cellMergeComp = cellComp
                    }
                    
                }
            }
        }
    }

    private setUnitDrag(cell) {

        const cellId = cell.getComponent(cellComponent).id

        this.gridComp.unitsParent.children.forEach((unit) => {
            const unitComp = unit.getComponent(unitComponent)
        
            if(unitComp.curCell[0] == cellId[0] && unitComp.curCell[1] == cellId[1]){
                this.unitDragged = unitComp
                audioManager.play("pickUnit")
            }
        })
    }


    protected update(dt: number): void {
        
        if(this.unitDragged){
            this.unitDragged.targetPosToMove = this.dragTargetPos
        }
    }
}