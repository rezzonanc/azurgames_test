import { _decorator, Component, Node, Vec3, tween, CCFloat } from 'cc'
import { enemyComponent } from './enemyComponent'
const { ccclass, property } = _decorator

@ccclass('arrowComponent')
export class arrowComponent extends Component {
    private target: enemyComponent
    private damage = 0

    @property(CCFloat)
    private flightDuration = 0.6

    @property(CCFloat)
    private spawnDuration = 0.15

    @property(CCFloat)
    private despawnDuration = 0.15

    @property(CCFloat)
    private arcHeight = 4

    @property(CCFloat)
    private lookAhead = 0.02

    private startPos = new Vec3()
    private targetPos = new Vec3()
    private currentPos = new Vec3()
    private nextPos = new Vec3()
    private moveDir = new Vec3()

    setup(target: enemyComponent, damage: number) {
        this.target = target
        this.damage = damage

        this.node.getWorldPosition(this.startPos)
        this.node.setScale(0, 0, 0)

        tween(this.node)
        .to(this.spawnDuration, { scale: new Vec3(1, 1, 1) })
        .start()

        const progress = { value: 0 }

        tween(progress)
        .to(this.flightDuration, { value: 1 }, {
            onUpdate: () => {
                if (!this.target){
                    this.kill()
                    return
                }
                this.target.arrowTargetNode.getWorldPosition(this.targetPos)

                const nextProgress = Math.min(1, progress.value + this.lookAhead)

                Vec3.lerp(this.currentPos, this.startPos, this.targetPos, progress.value)
                this.currentPos.y += Math.sin(progress.value * Math.PI) * this.arcHeight

                Vec3.lerp(this.nextPos, this.startPos, this.targetPos, nextProgress)
                this.nextPos.y += Math.sin(nextProgress * Math.PI) * this.arcHeight

                Vec3.subtract(this.moveDir, this.nextPos, this.currentPos)
                this.moveDir.normalize()

                this.node.setWorldPosition(this.currentPos)

                
                this.target.arrowTargetNode.getWorldPosition(this.targetPos)

                if(this.moveDir.length() > 0.1) {
                    this.node.lookAt(this.nextPos)
                }
            }
        })
        .call(() => {
            this.kill()
        })
        .start()
    }

    private kill(){
        if (this.target){ this.target.takeDamage(this.damage)}

        tween(this.node)
        .to(this.despawnDuration, { scale: new Vec3(0, 0, 0) })
        .call(() => this.node.destroy())
        .start()
    }
}

    