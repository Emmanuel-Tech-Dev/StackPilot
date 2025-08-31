import { Modal } from "antd";
import { useState } from "react";
import useDraggable from "./useDraggable";

const useModal = () => {
    const [open, setOpen] = useState(false);

    const [content, setContent] = useState();
    const [title, setTitle] = useState();
    const [width, setWidth] = useState(378);
    const [height, setHeight] = useState(378); //number or string
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [onOkText, setOnOkText] = useState("OK");

    const draggable = useDraggable();

    // const [closable, setClosable] = useState();
    // const [zIndex, setZIndex] = useState();
    // const [size, setSize] = useState();

    const [footer, setFooter] = useState(null);

    const modalJSX = (
        handleOk,
        handleCancel,
        localContent,
        localWidth = 500,
        extraProps = {},
        shouldDrag = true
    ) => {
        return (
            <Modal
                modalRender={(modal) => {
                    return shouldDrag ? draggable.drag(modal) : modal;
                }}
                title={
                    shouldDrag ? (
                        <div {...draggable.draggableTitleProps}>{title}</div>
                    ) : (
                        title
                    )
                }
                open={open}
                onOk={handleOk}
                onOkText={onOkText}
                confirmLoading={isSubmitting}
                width={parseInt(localWidth) || width}
                onCancel={handleCancel}
                {...extraProps}
            >
                {localContent}
                {content}
            </Modal>
        );
    };

    return {
        open,
        setOpen,
        content,
        setContent,
        title,
        setTitle,
        modalJSX,
        width,
        setWidth,
        height,
        setHeight,
        footer,
        setFooter,
        isSubmitting,
        setIsSubmitting,
        onOkText,
        setOnOkText
    };
};

export default useModal;
