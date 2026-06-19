class apiResponse {
    constructor(message, statusCode, data = null, success = true, code) {
        this.message = message;
        this.statusCode = statusCode;
        this.data = data;
        this.success = success;
        this.code = code
    }
}

export default apiResponse;