export type AppErrorParams = {
    message: string,
    statusCode: number,
    status: string
}
class AppError extends Error {
    statusCode: number;
    status: string;
    constructor({ message, statusCode, status }: AppErrorParams) {
        super(message);
        this.statusCode = statusCode;
        this.status = status;
    }
    // createError(props: AppErrorParams) {
    //     return new AppError({
    //         message: props.message,
    //         statusCode: props.statusCode,
    //         status: props.status
    //     })
    // }
}

export default AppError