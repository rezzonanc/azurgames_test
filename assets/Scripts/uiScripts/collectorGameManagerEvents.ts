import { _decorator, Component, Node } from 'cc';
import { GameEvents, BALANCE_UPDATED, PRICE_UPDATED } from '../gameManager';
import { EnemiesEvents, ENEMY_PASS } from '../gameplayBase/enemiesManager';
const { ccclass, property } = _decorator;

@ccclass('collectorGameManagerEvents')
export class collectorGameManagerEvents extends Component {
    
    protected onLoad(): void {
        GameEvents.on(PRICE_UPDATED, this.onPriceUpdated, this)
        GameEvents.on(BALANCE_UPDATED, this.onBalanceUpdated, this)

        EnemiesEvents.on(ENEMY_PASS, this.disableButton, this)
        this.fakeOnLoad()
    }
    
    protected onEnable(): void {
        GameEvents.on(PRICE_UPDATED, this.onPriceUpdated, this)
        GameEvents.on(BALANCE_UPDATED, this.onBalanceUpdated, this)

        EnemiesEvents.on(ENEMY_PASS, this.disableButton, this)
    }
    
    protected onDisable(): void {
        GameEvents.off(PRICE_UPDATED, this.onPriceUpdated, this)
        GameEvents.off(BALANCE_UPDATED, this.onBalanceUpdated, this)

        EnemiesEvents.off(ENEMY_PASS, this.disableButton, this)
    }

    protected fakeOnLoad(){
    }

    protected onPriceUpdated(price: number, balance: number) {
    }

    protected onBalanceUpdated(balance: number) {
        
    }

    protected disableButton(){
    }
}


