import { _decorator, Camera, Component, Node, screen } from 'cc';
import { GameEvents, HIDE_TUTOR } from '../gameManager';
const { ccclass, property } = _decorator;

@ccclass('camForUiOverUnits')
export class camForUiOverUnits extends Component {

    private camParent: Camera

    private camComp: Camera

    start() {
        this.camComp = this.node.getComponent(Camera)
        this.camParent = this.node.getParent().getComponent(Camera)

        screen.on("window-resize", this.onWindowResize, this)

        GameEvents.on(HIDE_TUTOR, this.kill, this)

        this.onWindowResize()
    }

    onWindowResize(){
        this.camComp.orthoHeight = this.camParent.orthoHeight
    }

    kill(){
        this.scheduleOnce(()=>{
            this.node.destroy()
        }, 1000)
        
    }
}


