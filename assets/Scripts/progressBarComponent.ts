import { _decorator, clamp, Component, find, Node, Tween, tween, UIOpacity, UITransform, Vec3 } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('progressBarComponent')
export class progressBarComponent extends Component {

    @property(UITransform)
    private fillUiTrans: UITransform
    
    private fullWidth: number
    private onePrecentWidth: number

    private camGameplay: Node
    
    private lookAtPos: Vec3 = new Vec3()
    
    protected onLoad(): void {
        this.fullWidth = this.fillUiTrans.width
        this.onePrecentWidth = this.fullWidth / 100

        this.camGameplay = find("Main Camera")
    }

    public fill(precentage: number){

        Tween.stopAllByTarget(this.fillUiTrans.contentSize)

        precentage = clamp(precentage, 0, 100)
        
        tween(this.fillUiTrans)
        .to(0.2, {width: this.onePrecentWidth * precentage}, {easing: "sineIn"})
        .start()
    }

    public kill(){
        const uiOp = this.node.getComponent(UIOpacity)
        tween(uiOp)
        .to(0.6, {opacity: 0})
        .call(()=>{
            this.node.destroy()
        })
        .start()
    }

    protected update(dt: number): void {
        
        Vec3.subtract(this.lookAtPos, this.node.worldPosition, this.camGameplay.forward)

        this.node.lookAt(this.lookAtPos)
    }
}