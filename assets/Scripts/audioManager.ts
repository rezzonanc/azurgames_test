import { _decorator, AudioSource, Component, Node } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('audioManager')
export class audioManager extends Component {
    
    public static instance: audioManager

    protected start(): void {
        audioManager.instance = this.node.getComponent(audioManager)
    }

    public static play(soundname: string){
        audioManager.instance.node.getChildByName(soundname).getComponent(AudioSource).play()
    }
}


