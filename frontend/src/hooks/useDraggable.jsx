import { useRef, useState } from "react"
import Draggable from "react-draggable"

const useDraggable = () => {

    const [disabled, setDisabled] = useState(false)

    const [bounds, setBounds] = useState({
        left: 0,
        top: 0,
        bottom: 0,
        right: 0,
    })

    const dragRef = useRef(null)


    const onDragStart = (_event, uiData) => {
        const { clientWidth, clientHeight } = window.document.documentElement
        const targetUi = dragRef.current?.getBoundingClientRect()

        if (!targetUi) return

        setBounds({
            left: -targetUi.left + uiData.x,
            right: clientWidth - (targetUi.right - uiData.x),
            top: -targetUi.top + uiData.y,
            bottom: clientHeight - (targetUi.bottom - uiData.y)
        })

    }
    const draggableTitleProps = {
        style: {
            width: "100%",
            cursor: "move",
        },

        onMouseOver: () => {
            if (disabled) {
                setDisabled(false)
            }
        }
        ,
        onMouseOut: () => {
            if (disabled) {
                setDisabled(false)
            }
        }
    }

    const drag = (modal) => {
        return <Draggable
            disabled={disabled}
            bounds={bounds}
            onStart={(event, uiData) => onDragStart(event, uiData)}
            nodeRef={dragRef}
        >
            <div ref={dragRef}>{modal}</div>
        </Draggable>
    }

    return { drag, draggableTitleProps, dragRef }

}


export default useDraggable