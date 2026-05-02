import { _decorator, CCInteger, Component, Node } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('cellComponent')
export class cellComponent extends Component {

    @property([CCInteger])
    public id: number[] = [-1, -1]
}


