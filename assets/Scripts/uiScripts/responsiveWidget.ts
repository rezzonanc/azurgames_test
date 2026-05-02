import { _decorator, Component, Widget, screen } from 'cc'
const { ccclass, property } = _decorator

@ccclass('responsiveWidget')
export class responsiveWidget extends Component {

    private widget: Widget = null

    @property({ group: { name: 'Portrait' } })
    pAlignLeft: boolean = false
    @property({ group: { name: 'Portrait' } })
    pAlignRight: boolean = false
    @property({ group: { name: 'Portrait' } })
    pAlignTop: boolean = false
    @property({ group: { name: 'Portrait' } })
    pAlignBottom: boolean = false
    @property({ group: { name: 'Portrait' } })
    pAlignHCenter: boolean = false
    @property({ group: { name: 'Portrait' } })
    pAlignVCenter: boolean = false

    @property({ group: { name: 'Portrait' } })
    portraitLeft: number = 0
    @property({ group: { name: 'Portrait' } })
    portraitRight: number = 0
    @property({ group: { name: 'Portrait' } })
    portraitTop: number = 0
    @property({ group: { name: 'Portrait' } })
    portraitBottom: number = 0
    @property({ group: { name: 'Portrait' } })
    portraitHCenter: number = 0
    @property({ group: { name: 'Portrait' } })
    portraitVCenter: number = 0

    @property({ group: { name: 'Landscape' } })
    lAlignLeft: boolean = false
    @property({ group: { name: 'Landscape' } })
    lAlignRight: boolean = false
    @property({ group: { name: 'Landscape' } })
    lAlignTop: boolean = false
    @property({ group: { name: 'Landscape' } })
    lAlignBottom: boolean = false
    @property({ group: { name: 'Landscape' } })
    lAlignHCenter: boolean = false
    @property({ group: { name: 'Landscape' } })
    lAlignVCenter: boolean = false

    @property({ group: { name: 'Landscape' } })
    landscapeLeft: number = 0
    @property({ group: { name: 'Landscape' } })
    landscapeRight: number = 0
    @property({ group: { name: 'Landscape' } })
    landscapeTop: number = 0
    @property({ group: { name: 'Landscape' } })
    landscapeBottom: number = 0
    @property({ group: { name: 'Landscape' } })
    landscapeHCenter: number = 0
    @property({ group: { name: 'Landscape' } })
    landscapeVCenter: number = 0

    protected onLoad(): void {
        this.widget = this.getComponent(Widget)
    }

    public updateLayout() {
        if (!this.widget) this.widget = this.getComponent(Widget)
        if (!this.widget) this.widget = this.addComponent(Widget)
        if (!this.widget) return
        
        const isPortrait = screen.windowSize.height > screen.windowSize.width

        this.widget.isAlignLeft = isPortrait ? this.pAlignLeft : this.lAlignLeft
        this.widget.isAlignRight = isPortrait ? this.pAlignRight : this.lAlignRight
        this.widget.isAlignTop = isPortrait ? this.pAlignTop : this.lAlignTop
        this.widget.isAlignBottom = isPortrait ? this.pAlignBottom : this.lAlignBottom
        this.widget.isAlignHorizontalCenter = isPortrait ? this.pAlignHCenter : this.lAlignHCenter
        this.widget.isAlignVerticalCenter = isPortrait ? this.pAlignVCenter : this.lAlignVCenter

        if (isPortrait) {
            if (this.pAlignLeft) this.widget.left = this.portraitLeft
            if (this.pAlignRight) this.widget.right = this.portraitRight
            if (this.pAlignTop) this.widget.top = this.portraitTop
            if (this.pAlignBottom) this.widget.bottom = this.portraitBottom
            if (this.pAlignHCenter) this.widget.horizontalCenter = this.portraitHCenter
            if (this.pAlignVCenter) this.widget.verticalCenter = this.portraitVCenter
        }
        else {
            
            if (this.lAlignLeft) this.widget.left = this.landscapeLeft
            if (this.lAlignRight) this.widget.right = this.landscapeRight
            if (this.lAlignTop) this.widget.top = this.landscapeTop
            if (this.lAlignBottom) this.widget.bottom = this.landscapeBottom
            if (this.lAlignHCenter) this.widget.horizontalCenter = this.landscapeHCenter
            if (this.lAlignVCenter) this.widget.verticalCenter = this.landscapeVCenter

        }

        this.widget.updateAlignment()
    }
}