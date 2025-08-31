import { useEffect, useState } from "react";
import utils from "../helpers/utility_func";



const usePaths = () => {

    const [paths, setPaths] = useState([])


    const cachedRoutes = localStorage.getItem("browser_resources")


    const fetchPath = async (endpoint, params, requestMethod, data) => {

        const res = await utils.fetchDataWithQuery(endpoint, params, requestMethod, data);

        // console.log(res)

        if (res.data) {
            setPaths(res.data)
            localStorage.setItem("browser_resources", JSON.stringify(res.data))
        }
    }

    useEffect(() => {
        if (cachedRoutes) {
            setPaths(JSON.parse(cachedRoutes))
        } else {
            fetchPath("/get_admin_browser_resources", {}, "get")
        }

    }, [])

    return { paths, setPaths }
}

export default usePaths