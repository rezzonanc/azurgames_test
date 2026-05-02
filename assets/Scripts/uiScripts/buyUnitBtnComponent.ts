import { _decorator, Button, Color, Component, Label, Node, Sprite, tween, UIOpacity, Vec3, Widget } from 'cc';
import { collectorGameManagerEvents } from './collectorGameManagerEvents';
import { EnemiesEvents, ENEMY_PASS } from '../gameplayBase/enemiesManager';
import { responsiveWidget } from './responsiveWidget';
const { ccclass, property } = _decorator;

@ccclass('buyUnitBtnComponent')
export class buyUnitBtnComponent extends collectorGameManagerEvents {
    
    @property(Label)
    private counterText: Label

    public button: Button

    @property(Node)
    public visualNode: Node

    @property([Sprite])
    private spritesInVisualNode: Sprite[ ] = []

    private defaultLabelColor: Color

    protected fakeOnLoad(){
        this.button = this.node.getComponent(Button)
        this.defaultLabelColor = this.counterText.color
    }


    onPriceUpdated(price: number, balance: number) {
        this.counterText.string = price.toString()

        if(price > balance){
            this.spritesInVisualNode.forEach(sprite => {
                sprite.grayscale = true
            });
            this.counterText.color = Color.BLACK
        }
        else{
            this.spritesInVisualNode.forEach(sprite => {
                sprite.grayscale = false
            });
            this.counterText.color = this.defaultLabelColor
        }
    }

    disableButton(){
        this.node.active = false
    }

    public switchRole(){
        
        this.visualNode.active = true
        this.node.setScale(Vec3.ONE)
        
        const rw: responsiveWidget = this.node.getComponent(responsiveWidget)
        
        rw.lAlignHCenter = false
        rw.lAlignVCenter = true
        rw.lAlignRight = true
        rw.landscapeHCenter = 0
        rw.landscapeRight = 80
        rw.landscapeVCenter = 0

        rw.updateLayout()

        const uiOp = this.node.getComponent(UIOpacity)
        uiOp.opacity = 0

        tween(uiOp)
        .to(0.3, {opacity: 255})
        .call(()=>{
            this.button.enabled = true
        }).start()
    }

}


