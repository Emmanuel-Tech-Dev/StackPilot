import { Input, Button, Space, message } from "antd";
import { SearchOutlined } from "@ant-design/icons";
import Highlighter from "react-highlight-words";
import { saveAs } from 'file-saver'
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

import axios from "axios";

// import qs from "qs";
import Settings from "./settings";
import moment from "moment";
import CountUp from "react-countup";
// import { set } from "lodash";
// import { legacyLogicalPropertiesTransformer } from "@ant-design/cssinjs";


const utils = {





    axiosInstance: axios.create({
        // baseURL: Settings.baseUrl,
        // withCredentials: true, // Allow sending cookies with requests
    }),

    getCookie: (cname) => {
        let name = `${cname}=`;
        // console.log(name);
        // return
        let ca = document.cookie.split(";");
        for (let i = 0; i < ca.length; i++) {
            let c = ca[i];
            while (c.charAt(0) == " ") {
                c = c.substring(1);
            }
            if (c.indexOf(name) == 0) {
                return c.substring(name.length, c.length);
            }
        }
        return "";
    },



    setupInterceptors: () => {
        let isRefreshing = false; // Track if a token refresh is in progress
        let refreshSubscribers = []; // Queue for pending requests

        const subscribeTokenRefresh = (callback) => {
            refreshSubscribers.push(callback);
        };

        const onRefreshed = () => {
            refreshSubscribers.forEach((callback) => callback());
            refreshSubscribers = [];
        };

        utils.axiosInstance.interceptors.response.use(
            (response) => response, // Pass through successful responses
            async (error) => {
                const originalRequest = error.config;

                // Skip interceptor logic for the refresh token endpoint
                if (originalRequest.url.includes("/auth/refreshToken")) {
                    return Promise.reject(error);
                }

                // Handle 401 Unauthorized errors
                if (error.response?.status === 401 && !originalRequest._retry) {
                    originalRequest._retry = true; // Mark the request as retried

                    if (!isRefreshing) {
                        isRefreshing = true;
                        try {
                            // Call the refresh token route
                            await utils.axiosInstance.post("/auth/refreshToken");

                            // Notify all pending requests
                            onRefreshed();
                            isRefreshing = false;

                            // Retry the original request
                            return utils.axiosInstance(originalRequest);
                        } catch (refreshError) {
                            console.error(refreshError.message);
                            isRefreshing = false;
                            refreshSubscribers = []
                            // Handle failure (e.g., redirect to login)
                            // window.location.href = "/login";
                            return Promise.reject(refreshError);
                        }
                    }

                    // Wait for the ongoing refresh to complete
                    return new Promise((resolve, reject) => {
                        const timeoutId = setTimeout(() => {
                            reject(new Error('Refresh token timeout'));
                            window.location.href = "/";
                        }, 10000);

                        subscribeTokenRefresh(() => {
                            clearTimeout(timeoutId);
                            resolve(utils.axiosInstance(originalRequest));
                        });
                    });
                }

                return Promise.reject(error);
            }
        );
    },


    // csrfInstance: () => {
    //   // CSRF token interceptor
    //   utils.axiosInstance.interceptors.request.use(async (config) => {
    //     if (!config.headers["X-CSRF-Token"]) {
    //       const { data } = await utils.axiosInstance.get("/csrf-token");
    //       config.headers["X-CSRF-Token"] = data.csrfToken;
    //     }
    //     return config;
    //   });
    // },

    refreshToken: async () => {
        try {
            const response = await utils.axiosInstance.post("/auth/refreshToken");
            return response;
        } catch (error) {
            console.log(error.message);
            throw error.response.data;
        }
    },

    login: async (data) => {
        try {
            const response = await utils.axiosInstance.post("/auth/login", data);
            console.log(response)
            if (response.status === 200) {
                console.log("Login successful.");
                return response.data;
            } else {
                throw new Error("Login failed.");
            }
        } catch (error) {
            console.log(error.message);
            return error.response.data
        }
    },

    getUser: async () => {
        try {

            const response = await utils.axiosInstance.get("/auth/user/profile");
            return response
        } catch (error) {

            console.log(error.message)
            return error.response.data
        }
    },

    otpRequest: async (data) => {
        try {
            const response = await utils.axiosInstance.post("/auth/otp-request", data)
            return response.data
        } catch (error) {
            console.log(error.message)
            return error.response.data
        }
    },

    otpVerify: async (data) => {
        try {
            const response = await utils.axiosInstance.post("/auth/verify-otp", data)
            return response.data
        } catch (error) {
            console.log(error.message)
            return error.response.data
        }
    },


    passwordReset: async (data) => {
        try {
            const response = await utils.axiosInstance.post("/auth/password-request", data);
            return response.data;
        } catch (error) {
            console.log(error.message);
            return error.response.data;
        }
    },

    passwordVerify: async (token, data) => {
        try {
            const response = await utils.axiosInstance.post(`/auth/reset-password/:${token}`, data);
            return response.data;
        } catch (error) {
            console.log(error.message);
            return error.response.data;
        }
    },

    logOut: async () => {
        try {
            const response = await utils.axiosInstance.post("/auth/logout");
            return response.data;
        } catch (error) {
            console.log("Error logging out: ", error.message);
            return error.response.data;
        }
    },

    async requestWithReauth(method, url, endpoint, data = {}) {
        // Combine url and endpoint into a single URL
        const fullUrl = endpoint ? `${url}${endpoint}` : url;

        // Call the simplified request function
        const response = await utils.request(method, fullUrl, data);
        return response;
    },

    async request(method, url, data = {}) {
        try {
            const response = await utils.axiosInstance({
                method: method.toLowerCase(),
                url: url,
                data,
            });

            // console.log(response);
            return response?.data;
        } catch (error) {
            console.error('Error in request:', error);
            throw error;
        }
    },

    //   fetchDataWithQuery: async (endpoint, params = {}, method = "get", data = null) => {




    //     try {
    //       // Build the URL
    //       let url = `${Settings.baseUrl}${endpoint}`;

    //       // console.log(url)


    //       // Include only page and limit in the query string
    //       // const queryParams = {
    //       //   page: params.page || 1,
    //       //   limit: params.limit || 10,
    //       // };

    //       // if (params.search) {
    //       //   queryParams.search = params.search;
    //       // }
    //       // if (params.sortBy) {
    //       //   queryParams.sortBy = params.sortBy;
    //       //   queryParams.sortOrder = params.sortOrder || "ASC"; // Default to ASC if sortBy is provided
    //       // }
    //       // if (params.attributes) {
    //       //   queryParams.attributes = params.attributes
    //       // }
    //       // const queryString = qs.stringify(queryParams, { arrayFormat: "repeat" });
    //       // if (queryString) {
    //       //   url += `?${queryString}`;
    //       // }



    //       const res = await utils.request(method, url, endpoint, data);

    //       // if (res.data === null || res.data === undefined) {
    //       //   console.log("No response received from the server")
    //       // }

    //       console.log(res)

    //       // Check for the status in the response

    //       return res;

    //     } catch (error) {
    //       console.log(error)
    //       console.error("Server error:", error.response.data);
    //       return error.response.data
    //       // Handle server errors specifically


    //     }
    //   },

    //   fetchRoomByHall: async (endpoint, params = {}, hallId) => {
    //     try {
    //       let url = `${Settings.baseUrl}${endpoint}`;
    //       // Include only page and limit in the query string
    //       const queryParams = {
    //         page: params.page || 1,
    //         limit: params.limit || 10,
    //       };

    //       if (params.search) {
    //         queryParams.search = params.search;
    //       }
    //       if (params.sortBy) {
    //         queryParams.sortBy = params.sortBy;
    //         queryParams.sortOrder = params.sortOrder || "ASC"; // Default to ASC if sortBy is provided
    //       }
    //       if (params.attributes) {
    //         queryParams.attributes = params.attributes
    //       }
    //       if (params.capacity) {
    //         queryParams.capacity = params.capacity
    //       }
    //       const queryString = qs.stringify(queryParams, { arrayFormat: "repeat" });
    //       if (queryString) {
    //         url += `?${queryString}`;
    //       }

    //       const res = await utils.axiosInstance.get(
    //         url,
    //         hallId
    //       );

    //       return res.data

    //     } catch (error) {
    //       console.log(error.message)
    //       return error.response.data
    //     }


    //   },

    getStatistics: async (endpoint, params = {}) => {
        try {
            const url = `${Settings.baseUrl}${endpoint}`;
            const res = await utils.axiosInstance.get(url, params);
            return res.data
        } catch (error) {
            return error.response.data
        }
    },

    getASingleData: async (endpoint, id) => {
        try {
            const url = `${Settings.baseUrl}${endpoint}/${id}`;
            const res = await utils.axiosInstance.get(url);
            return res.data
        } catch (error) {
            return error.response.data
        }
    },

    getGroupedData: async (endpoint) => {
        try {
            const url = `${Settings.baseUrl}${endpoint}`;

            const res = await utils.axiosInstance.get(url)
            // console.log(res.data)
            return res.data

        } catch (error) {
            return error.response.data
        }

    },

    deleteData: async (endpoint, id) => {
        try {
            const url = `${Settings.baseUrl}${endpoint}${id}`;
            const response = await utils.axiosInstance.delete(url, id);
            return response.data;
        } catch (error) {
            console.error("Delete Error:", error);
            return error.response.data;
        }
    },

    postData: async (endpoint, data) => {
        try {
            const url = `${Settings.baseUrl}${endpoint}`;
            const res = await utils.axiosInstance.post(url, data)
            return res.data
        } catch (error) {
            return error.response.data
        }

    },

    uploadExcelFile: async (endpoint, model, file) => {
        try {
            const formData = new FormData();
            formData.append('file', file);

            const url = `${Settings.baseUrl}${endpoint}${model}`;

            const res = await utils.axiosInstance.post(url, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
                // Add timeout and show upload progress if needed
                timeout: 30000,
                onUploadProgress: (progressEvent) => {
                    const percentCompleted = Math.round(
                        (progressEvent.loaded * 100) / progressEvent.total
                    );
                    // You can use this to show upload progress if desired
                    console.log(`Upload Progress: ${percentCompleted}%`);
                },
            });

            return res;
        } catch (error) {
            console.error("Upload error details:", error.response || error);
            throw new Error(error.response?.data?.message || error.message || "Upload failed");
        }
    },

    updateData: async (endpoint, data, id) => {

        try {
            const url = `${Settings.baseUrl}${endpoint}/${id}`;
            const res = await utils.axiosInstance.put(url, data, id)

            return res.data
        } catch (error) {
            console.log(error.messsage)
            return error.response.data
        }

    },



    getColumnSearchProps: (dataIndex, searchConfig, searchInput) => {
        const { searchText, setSearchText, searchedColumn, setSearchedColumn } = searchConfig;

        const handleSearch = (selectedKeys, confirm) => {
            confirm();
            setSearchText(selectedKeys[0]);
            setSearchedColumn(dataIndex);
        };

        const handleReset = (clearFilters) => {
            clearFilters();
            setSearchText("");
            setSearchedColumn(null);
        };

        return {
            filterDropdown: ({
                setSelectedKeys,
                selectedKeys,
                confirm,
                clearFilters,
                close,
            }) => (
                <div style={{ padding: 8 }} onKeyDown={(e) => e.stopPropagation()}>
                    <Input
                        ref={searchInput}
                        placeholder={`Search ${dataIndex}`}
                        value={selectedKeys[0]}
                        onChange={(e) => setSelectedKeys(e.target.value ? [e.target.value] : [])}
                        onPressEnter={() => handleSearch(selectedKeys, confirm)}
                        style={{ marginBottom: 8, display: "block" }}
                    />
                    <Space>
                        <Button
                            type="primary"
                            onClick={() => handleSearch(selectedKeys, confirm)}
                            icon={<SearchOutlined />}
                            size="small"
                            style={{ width: 90 }}
                        >
                            Search
                        </Button>
                        <Button
                            onClick={() => handleReset(clearFilters)}
                            size="small"
                            style={{ width: 90 }}
                        >
                            Reset
                        </Button>
                        <Button
                            type="link"
                            size="small"
                            onClick={() => {
                                confirm({ closeDropdown: false });
                                handleSearch(selectedKeys, confirm);
                            }}
                        >
                            Filter
                        </Button>
                        <Button
                            type="link"
                            size="small"
                            onClick={() => close()}
                        >
                            Close
                        </Button>
                    </Space>
                </div>
            ),
            filterIcon: (filtered) => (
                <SearchOutlined style={{ color: filtered ? "#1890ff" : undefined }} />
            ),
            onFilter: (value, record) =>
                record[dataIndex]
                    ? record[dataIndex].toString().toLowerCase().includes(value.toLowerCase())
                    : "",
            render: (text) =>
                searchedColumn === dataIndex ? (
                    <Highlighter
                        highlightStyle={{ backgroundColor: "#ffc069", padding: 0 }}
                        searchWords={[searchText]}
                        autoEscape
                        textToHighlight={text ? text.toString() : ""}
                    />
                ) : (
                    text
                ),
        };
    },

    calculateDataOfAndArray: (
        data, value
    ) => {
        const totalValue = data?.reduce((acc, item) => acc + item[value], 0);
        return totalValue

    },

    getBase64: (file) =>
        new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = () => resolve(reader.result);
            reader.onerror = (error) => reject(error);
        }),

    handleDownloadCSV: (data, filename) => {
        const csvData = data?.map((item) => Object.values(item));
        const csvHeaders = Object.keys(data[0]);
        const csvContent = [csvHeaders, ...csvData].map((row) => row.join(',')).join('\n');
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8' });
        saveAs(blob, `${filename}.csv`);
    },

    currencyConvertor: (amount, currency = "GHS") => {
        // Using Intl.NumberFormat for currency formatting
        const formatter = new Intl.NumberFormat('en-US', { style: 'currency', currency: currency });
        return formatter.format(amount); // $123,456.7
    },

    dateFormatter: (date) => {
        const dateFormatter = new Intl.DateTimeFormat('en-GB', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
        });

        // Check if date is already a Date object, otherwise convert it
        const validDate = date instanceof Date ? date : new Date(date);

        // Check if the conversion to Date was successful
        if (isNaN(validDate)) {
            console.error("Invalid date:", date);
            return "Invalid date";
        }

        return dateFormatter.format(validDate);
    },


    // format a number as a percentage
    percentageFormatter: (value) => {
        const percentageFormatter = new Intl.NumberFormat('en-US', { style: 'percent', minimumFractionDigits: 2 });
        return percentageFormatter.format(value);
    },

    formatNumber: (value) => {
        value = Number(value);
        console.log('Converted to number:', value); // Debugging statement
        if (isNaN(value)) return '0';
        if (value < 1000) return value.toString();
        const units = ["", "K", "M", "B", "T", "Q"];
        let unitIndex = 0;

        while (value >= 1000 && unitIndex < units.length - 1) {
            value /= 1000;
            unitIndex++;
            console.log('Value after division:', value, 'Unit index:', unitIndex); // Debugging statement
        }

        const formattedValue = value.toFixed(1).replace(/\.0$/, "") + units[unitIndex];
        console.log('Formatted value:', formattedValue); // Debugging statement
        return formattedValue;
    },
    // Purals
    purals: (text) => {
        const pluralize = new Intl.PluralRules('en');
        return pluralize.select(text);
    },

    //Format relative time
    relativeTimeFormart: (date) => {
        const relativeTimeFormatter = new Intl.RelativeTimeFormat('en', { numeric: 'auto' });
        const now = new Date();
        const differenceInMs = date - now;

        // Calculate time differences
        const seconds = Math.round(differenceInMs / 1000);
        const minutes = Math.round(differenceInMs / (1000 * 60));
        const hours = Math.round(differenceInMs / (1000 * 60 * 60));
        const days = Math.round(differenceInMs / (1000 * 60 * 60 * 24));

        // Determine the appropriate unit and return the formatted string
        if (Math.abs(days) >= 1) {
            return relativeTimeFormatter.format(days, 'day');
        } else if (Math.abs(hours) >= 1) {
            return relativeTimeFormatter.format(hours, 'hour');
        } else if (Math.abs(minutes) >= 1) {
            return relativeTimeFormatter.format(minutes, 'minute');
        } else {
            return relativeTimeFormatter.format(seconds, 'second');
        }
    },

    generateRandomColor: () => {
        const letter = "BCDEF"
        let color = "#"
        for (let i = 0; i < 6; i++) {
            color += letter[Math.floor(Math.random() * letter.length)]
        }

        return color
    },

    dateConvertor: (date) => {
        const formateDate = moment(date).format("MMMM DD, YYYY hh:mm:ss a")
        return formateDate
    },
    dateConvertorV2: (date) => {
        const formateDate = moment(date).format("MMMM DD, YYYY")
        return formateDate
    },

    printReceipts: (printableId) => {
        const printable = document.getElementById(printableId);
        if (!printable) {
            console.error(`Element with ID "${printableId}" not found.`);
            return;
        }

        // Ensure a single print window instance
        let printWindow = window.open("", "printWindow", "width=1000,height=1000");
        if (!printWindow) {
            console.error("Failed to open print window. Please check browser popup settings.");
            return;
        }

        // Fetch styles from the current document
        const styles = Array.from(document.querySelectorAll("link[rel='stylesheet'], style"))
            .map((style) => style.outerHTML)
            .join("\n");

        const html = printable.innerHTML;

        // Write the printable content with styles
        printWindow.document.write(`
    <html>
      <head>
        ${styles} <!-- Inject styles -->
      </head>
      <body>${html}</body>
    </html>
  `);


        setTimeout(() => {
            printWindow.document.close();
            printWindow.focus();
            printWindow.print();
            printWindow.close();

        }, 500);

        // Delay by 0ms to allow the DOM to update
    },

    generatePdf: (ref) => {
        const element = document.getElementById(ref)

        html2canvas(element, {
            scale: 2,
            useCORS: true,
            logging: false,
        }).then((canvas) => {

            const imgData = canvas.toDataURL("image/png")
            const pdf = new jsPDF({
                orientation: "landscape",
                unit: "px",
                format: "a5",
                // margins: 20

            })
            const imgProps = pdf.getImageProperties(imgData);
            const pdfWidth = pdf.internal.pageSize.getWidth() - 10;
            const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;

            pdf.addImage(
                imgData,
                'PNG',
                0,
                0,
                pdfWidth,
                pdfHeight,
                undefined,
                'FAST'
            );

            pdf.save(`Receipt-${new Date().toISOString().slice(0, 10)}.pdf`);
        }).catch((error) => {
            console.error('PDF Generation Error:', error);
            message.error('Failed to generate PDF');
        });
    },
    truncateText: (title, maxLength) => {
        if (title.length > maxLength) {
            return title.slice(0, maxLength - 3) + "...";
        }
        return title;
    },
    getInitials: (data) => {
        const firstLetter = data.charAt(0).toUpperCase();

        return firstLetter;
    },

    getInitials_v2: (name) => {
        const syllabul = name?.split(' ')?.map(word => word[0]?.toUpperCase())?.join('');

        return syllabul
    },

    copyToClipboard: async (text) => {
        try {
            await navigator.clipboard.writeText(text);
            message.success("Copied to clipboard")
        } catch (error) {
            console.log(error)
            return message.error("Failed to copy to clipboard")
        }
    },

    formatter: (value) => {
        return <CountUp end={value} separator="," />
    }

    ,
    fromNow(date) {
        const SECOND = 1000;
        const MINUTE = 60 * SECOND;
        const HOUR = 60 * MINUTE;
        const DAY = 24 * HOUR;
        const WEEK = 7 * DAY;
        const MONTH = 30 * DAY;
        const YEAR = 365 * DAY;
        const units = [
            { max: 30 * SECOND, divisor: 1, past1: 'just now', pastN: 'just now', future1: 'just now', futureN: 'just now' },
            { max: MINUTE, divisor: SECOND, past1: 'a second ago', pastN: '# seconds ago', future1: 'in a second', futureN: 'in # seconds' },
            { max: HOUR, divisor: MINUTE, past1: 'a minute ago', pastN: '# minutes ago', future1: 'in a minute', futureN: 'in # minutes' },
            { max: DAY, divisor: HOUR, past1: 'an hour ago', pastN: '# hours ago', future1: 'in an hour', futureN: 'in # hours' },
            { max: WEEK, divisor: DAY, past1: 'yesterday', pastN: '# days ago', future1: 'tomorrow', futureN: 'in # days' },
            { max: 4 * WEEK, divisor: WEEK, past1: 'last week', pastN: '# weeks ago', future1: 'in a week', futureN: 'in # weeks' },
            { max: YEAR, divisor: MONTH, past1: 'last month', pastN: '# months ago', future1: 'in a month', futureN: 'in # months' },
            { max: 100 * YEAR, divisor: YEAR, past1: 'last year', pastN: '# years ago', future1: 'in a year', futureN: 'in # years' },
            { max: 1000 * YEAR, divisor: 100 * YEAR, past1: 'last century', pastN: '# centuries ago', future1: 'in a century', futureN: 'in # centuries' },
            { max: Infinity, divisor: 1000 * YEAR, past1: 'last millennium', pastN: '# millennia ago', future1: 'in a millennium', futureN: 'in # millennia' },
        ];
        const diff = Date.now() - (typeof date === 'object' ? date : new Date(date)).getTime();
        const diffAbs = Math.abs(diff);
        for (const unit of units) {
            if (diffAbs < unit.max) {
                const isFuture = diff < 0;
                const x = Math.round(Math.abs(diff) / unit.divisor);
                if (x <= 1) return isFuture ? unit.future1 : unit.past1;
                return (isFuture ? unit.futureN : unit.pastN).replace('#', x);
            }
        }
    },

    bootstrap: (valuesStore, settingsStore, fetchItems, auto = true) => {
        if (auto) {
            const states = settingsStore.getStates();
            Object.keys(states)?.forEach(async (p, i) => {
                const params = states[p];
                if (typeof params == 'object') {
                    let data = {
                        critfdx: params?.critfdx,
                        critval: params?.critval,
                        logical: params?.logical,
                        table: params?.table,
                        getall: params?.getall,
                        fields: params?.fields,
                    };
                    let res = await utils.requestWithReauth(params.method, params.url, null, data);
                    valuesStore.setValue(params.storeName, res);
                }
            });
        }
        if (fetchItems) {
            fetchItems?.forEach(async (params, i) => {
                let data = {
                    critfdx: params?.critfdx,
                    critval: params?.critval,
                    logical: params?.logical,
                    table: params?.table,
                    getall: params?.getall,
                    fields: params?.fields,
                };
                let res = await utils.requestWithReauth(params.method, params.url, null, data);
                valuesStore.setValue(params.storeName, res);
            });
        }
    },




}


// utils.setupInterceptors();
// utils.csrfInstance()

export default utils;
