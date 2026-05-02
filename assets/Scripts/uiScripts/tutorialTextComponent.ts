import { _decorator, Component, Node, Sprite, SpriteFrame } from 'cc';
import { responsiveWidget } from './responsiveWidget';
const { ccclass, property } = _decorator;

@ccclass('tutorialTextComponent')
export class tutorialTextComponent extends Component {
    
    @property(SpriteFrame)
    private mergeHeroesTextSF: SpriteFrame

    private spriteComp: Sprite

    protected onLoad(){
        this.spriteComp = this.node.getComponent(Sprite)
    }

    public switchRole(){
        this.spriteComp.spriteFrame = this.mergeHeroesTextSF

        const rw: responsiveWidget = this.node.getComponent(responsiveWidget)
        
        rw.lAlignHCenter = true
        rw.lAlignTop = true
        rw.lAlignVCenter = false
        rw.landscapeHCenter = 0
        rw.landscapeVCenter = 0
        rw.landscapeTop = 70
    }
}


