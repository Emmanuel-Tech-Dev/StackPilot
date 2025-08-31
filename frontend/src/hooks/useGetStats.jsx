import { message } from "antd";
import { useEffect, useState } from "react";
import utils from "../helpers/utility_func";

const useGetStats = (endpoint, params = {}) => {
    const [data, setData] = useState([]);

    const getKeyMetrix = async () => {
        try {
            const res = await utils.getStatistics(endpoint, params);
            if (res.status === "ok") {
                setData(res.data);
            } else {
                setData([]);
                message.error(res.message);
            }
        } catch (error) {
            console.log(error);
            message.error(error.message);
        }
    };

    useEffect(() => {
        getKeyMetrix();
    }, []); // Add dependencies to re-fetch if endpoint or params change

    console.log(data)
    return data;
};

export default useGetStats;