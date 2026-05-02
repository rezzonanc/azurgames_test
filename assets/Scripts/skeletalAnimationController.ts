import { _decorator, Component, Node, SkeletalAnimation } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('skeletalAnimationController')
export class skeletalAnimationController extends Component {
    
    private root: Node 
    private skel: SkeletalAnimation

    public setup(rootNode: Node, skell: SkeletalAnimation){

        this.root = rootNode;
        this.skel = skell

        this.skel.on(SkeletalAnimation.EventType.FINISHED, this.onAnimFinished, this)
        
    }

    onAnimFinished(type: any, state: any) {
        if(state.name == "Attack"){
            this.root.emit("anim-attack-finished")
            
        }
        else if(state.name == "Death"){
            this.root.emit("anim-death-finished")
        }
    }
    
    onShoot(){
        this.root.emit("anim-shoot")
    }
}


