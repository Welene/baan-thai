import { sendResponse } from "../response/response";

export const errorHandler = () => ({
    onError: (handler) => {
        handler.reponse = sendResponse(404, { message: handler.error.message });
    },
});