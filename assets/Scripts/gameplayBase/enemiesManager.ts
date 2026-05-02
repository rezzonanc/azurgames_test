import { _decorator, CCFloat, CCInteger, Component, instantiate, Node, Prefab, Vec3, EventTarget } from 'cc';
import { enemyComponent, EnemyState } from './enemyComponent';
import { gameManager } from '../gameManager';

const { ccclass, property } = _decorator;

export const EnemiesEvents = new EventTarget()

export const ENEMY_PASS = "enemy-pass"
export const ENEMY_DIED = "enemy-died"

@ccclass('enemiesManager')
export class enemiesManager extends Component {

    @property([Prefab])
    private enemiesPrefabsArray: Prefab[] = []

    private enemiesArray: Node[] = []

    @property(Node)
    private enemiesParent: Node
    
    @property(Node)
    private pointsParent: Node
    
    @property(CCInteger)
    private enemiesCount: number = 17

    @property(CCInteger)
    private bossesCount: number = 1

    @property(CCFloat)
    private distBetweenEnemies: number = 3

    @property(CCFloat)
    private enemiesMoveSpeed: number = 5

    protected start(): void {
        this.createEnemies()
        EnemiesEvents.on(ENEMY_DIED, this.checkAllEnemiesDead, this )
    }

    createEnemies(){
        for (let i = 0; i < this.enemiesCount; i++) {
            
            let enemy: Node

            if((this.enemiesCount - i) <= this.bossesCount){
                enemy = instantiate(this.enemiesPrefabsArray[1])
            }
            else{
                enemy = instantiate(this.enemiesPrefabsArray[0])
            }
            
            enemy.parent = this.enemiesParent
            enemy.setWorldPosition(this.enemiesParent.worldPosition.clone().add(new Vec3(this.distBetweenEnemies * i, 0, 0)))
            enemy.getComponent(enemyComponent).setup(this.pointsParent.children, this.enemiesMoveSpeed)

            this.enemiesArray.push(enemy)

        }

    }

    public returnNearestEnemyToEnd(): Node {
        for (let i = 0; i < this.enemiesArray.length; i++) {
            const enemyComp: enemyComponent = this.enemiesArray[i].getComponent(enemyComponent)
            if (enemyComp.state != EnemyState.dead && !enemyComp.isPickedByUnit){

                enemyComp.isPickedByUnit = true

                return this.enemiesArray[i]

                break
            }
            
        }

        for (let i = 0; i < this.enemiesArray.length; i++) {
            const enemyComp: enemyComponent = this.enemiesArray[i].getComponent(enemyComponent)
            if (enemyComp.state != EnemyState.dead){

                enemyComp.isPickedByUnit = true

                return this.enemiesArray[i]

            }
            
        }
        
    }

    checkAllEnemiesDead(){
        let alive: number = 0
        this.enemiesParent.children.forEach(enemy => {
            const comp = enemy.getComponent(enemyComponent)
            if(comp.state != EnemyState.dead) alive++
        });

        if(alive == 0) gameManager.redirect = true
    }
}


