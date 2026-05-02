import { _decorator, CCFloat, CCInteger, Component, instantiate, Node, Prefab, Vec3 } from 'cc';
import { unitComponent, UnitState } from './unitComponent';
import { cellComponent } from './cellComponent';
const { ccclass, property } = _decorator;

@ccclass('gridComponent')
export class gridComponent extends Component {

    @property(CCInteger)
    private gridWidth: number = 5

    @property(CCInteger)
    private gridHeight: number = 4

    public grid: number[][] = []

    private freeCells: { x: number; y: number }[] = []

    @property(Node)
    private startPosNode: Node

    private startPos: Vec3 = new Vec3()

    @property(CCFloat)
    private xOffsetBetweenCells: number = 1.5

    @property(CCFloat)
    private yOffsetBetweenCells: number = 1.5

    @property(Prefab)
    private cellPrefab: Prefab

    @property(Node)
    private cellsParent: Node

    @property(Node)
    public unitsParent: Node

    @property([Prefab])
    private unitsPrefsArray: Prefab[] = []

    protected onLoad(): void {
        this.generateGrid()
    }

    generateGrid() {
        this.grid = []

        for (let x = 0; x < this.gridWidth; x++) {
            this.grid.push([])
            for (let y = 0; y < this.gridHeight; y++) {
                this.grid[x].push(0)
            }
        }

        this.startPos = this.startPosNode.getWorldPosition()

        this.grid.forEach((column, x) => {
            column.forEach((element, y) => {
                const cell = instantiate(this.cellPrefab)
                cell.parent = this.cellsParent
                cell.setWorldPosition(this.getCellWorldPos(x, y))
                cell.getComponent(cellComponent).id = [x, y]
            })
        })

        this.addUnit(false, 2, 2, 1)
    }

    getCellWorldPos(gridX: number, gridY: number): Vec3 {
        return new Vec3(this.startPos.x - this.xOffsetBetweenCells * gridX, this.startPos.y, this.startPos.z - this.yOffsetBetweenCells * gridY)
    }

    addUnit(random: boolean, gridX: number, gridY: number, unitLvl) {

        this.setFreeCells()

        const gridIndex = this.pickCell(random, gridX, gridY)


        var unit = instantiate(this.unitsPrefsArray[unitLvl - 1])
        unit.parent = this.unitsParent
        unit.setWorldPosition(this.getCellWorldPos(gridIndex.x, gridIndex.y))
        unit.getComponent(unitComponent).setup(gridIndex.x, gridIndex.y, unit.worldPosition)

        this.setCellBusy(gridIndex.x, gridIndex.y, unit.getComponent(unitComponent).lvl)
    }

    setFreeCells() {
        this.freeCells = []

        for (let x = 0; x < this.grid.length; x++) {
            for (let y = 0; y < this.grid[x].length; y++) {
                if (this.grid[x][y] === 0) {
                    this.freeCells.push({ x, y })
                }
            }
        }

        return this.freeCells
    }

    pickCell(random: boolean, gridX: number, gridY: number) {
        let x: number
        let y: number

        if (!random) {
            x = gridX
            y = gridY
        }
        else {
            const randomCell = this.freeCells[Math.floor(Math.random() * this.freeCells.length)]
            if (!randomCell) return null

            x = randomCell.x
            y = randomCell.y
        }

        return {x: x, y: y}
    }

    setCellFree(gridX: number, gridY: number){
        this.grid[gridX][gridY] = 0
    }

    setCellBusy(gridX: number, gridY: number, val){
        this.grid[gridX][gridY] = val
    }

    public placeUnitOnCell(unitComp: unitComponent, cellComp: cellComponent){

        this.setCellFree(unitComp.curCell[0], unitComp.curCell[1])

        const gridIndex = this.pickCell(false, cellComp.id[0], cellComp.id[1])
        
        this.setCellBusy(gridIndex.x, gridIndex.y, unitComp.lvl)


        unitComp.curCell = cellComp.id
        unitComp.targetPosToMove = new Vec3(cellComp.node.worldPosition.x, 0, cellComp.node.worldPosition.z)
    }

    public checkCellIsFree(gridX: number, gridY: number): boolean{
        if(this.grid[gridX][gridY] === 0){
            return true
        }
        else
            return false
    }

    public mergeIsPossible(unitComp: unitComponent, cellComp: cellComponent): boolean {
        return this.grid[cellComp.id[0]][cellComp.id[1]] === this.grid[unitComp.curCell[0]][unitComp.curCell[1]] && this.grid[cellComp.id[0]][cellComp.id[1]] > 0 && this.grid[cellComp.id[0]][cellComp.id[1]] < this.unitsPrefsArray.length
    }

    public mergeUnits(unitComp: unitComponent, cellComp: cellComponent){
        
        this.setCellFree(unitComp.curCell[0], unitComp.curCell[1])
        
        this.addUnit(false, cellComp.id[0], cellComp.id[1], unitComp.lvl + 1)

        for(const unit of this.unitsParent.children){

            const compUnit = unit.getComponent(unitComponent)
            
            if( compUnit.lvl === unitComp.lvl && ((compUnit.curCell[0] == cellComp.id[0] && compUnit.curCell[1] == cellComp.id[1]) || (compUnit.curCell[0] == unitComp.curCell[0] && compUnit.curCell[1] == unitComp.curCell[1]))){
                unit.destroy()
            }
        }
    }

    public returnClosestUnit(worldPos: Vec3): Node {

        let closestUnit: Node = null
        let minDistanceSqr = 1000000
        
        let tempPos = new Vec3()

        for (const unit of this.unitsParent.children) {

            unit.getWorldPosition(tempPos)

            const distanceSqr = Vec3.squaredDistance(worldPos, tempPos)
            if (distanceSqr < minDistanceSqr && unit.getComponent(unitComponent).state === UnitState.alive) {
                minDistanceSqr = distanceSqr
                closestUnit = unit
            }
        }

        return closestUnit
    }

    public returnCellsForMergeTutor(): Node[] {
    
        let sameCells: number[][] = []
        let arrNodes: Node[] = []

        for (let x = 0; x < this.grid.length; x++) {
            for (let y = 0; y < this.grid[x].length; y++) {
                if(this.grid[x][y] === 1){
                    sameCells.push([x, y])
                    if(sameCells.length === 2) break
                }
            }
            if(sameCells.length === 2) break
        }

        this.cellsParent.children.forEach(node => {
            const cellComp = node.getComponent(cellComponent)

            if(cellComp){
                const isMatch = sameCells.some(coords => coords[0] === cellComp.id[0] && coords[1] === cellComp.id[1])
                
                if(isMatch){
                    arrNodes.push(node)
                }
            }
        })

        return arrNodes
    }
}