import { Drawer } from "antd";
import { useState } from "react";




const useDrawer = () => {
    const [open, setOpen] = useState(false);
    const [placement, setPlacement] = useState('left');
    const [content, setContent] = useState();
    const [title, setTitle] = useState();
    const [closable, setClosable] = useState();

    const [zIndex, setZIndex] = useState();
    const [width, setWidth] = useState(378);

    // const [keyboard, setKeyboard] = useState(true);//boolean default:true
    const [height, setHeight] = useState(378);//number or string
    // const [headerStyle, setHeaderStyle] = useState();

    const onClose = () => setOpen(false)


    const drawerJSX = (localzIndex, localContent) => {
        return <>
            <Drawer
                width={width}
                height={height}
                title={title}
                placement={placement}
                closable={closable}
                onClose={onClose}
                open={open}
                key={placement}
                zIndex={localzIndex || zIndex}
            >
                {content}
                {localContent}
            </Drawer>
        </>

    }


    return {
        open, setOpen, placement, setPlacement, content, setContent, title, setTitle, closable,
        setClosable, drawerJSX, width, setWidth, height, setHeight, onClose,
        setZIndex
    }

}

export default useDrawer