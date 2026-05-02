import { _decorator, Component, Label, Node } from 'cc';
import { collectorGameManagerEvents } from './collectorGameManagerEvents';
const { ccclass, property } = _decorator;

@ccclass('moneyBarComponent')
export class moneyBarComponent extends collectorGameManagerEvents {
    
    @property(Label)
    private counterText: Label

    protected fakeOnLoad(){
        
    }

    onBalanceUpdated(money: number) {
        this.counterText.string = money.toString()
    }
}


