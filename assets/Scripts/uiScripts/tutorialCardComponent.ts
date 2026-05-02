import { _decorator, Component, Node, tween, Vec3 } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('tutorialCardComponent')
export class tutorialCardComponent extends Component {
    
    @property(Node)
    private light: Node

    @property(Vec3)
    private instPos: Vec3 = new Vec3()

    @property(Vec3)
    private targetPos: Vec3 = new Vec3()

    protected onLoad(): void {
        this.tweenLight()
    }

    tweenLight(){
        this.light.setPosition(this.instPos)

        tween(this.light)
        .to(1, {position: this.targetPos}, {easing: "sineInOut"})
        .call(()=>{
            this.scheduleOnce(()=>{
                this.tweenLight()
            }, 0.7)
        })
        .start()
    }
}


