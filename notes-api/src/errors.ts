export class HttpException extends Error {
    code: number
    details: string[]

    constructor(code: number, message: string, details?: string[]) {
        super(message)
        this.code = code
        this.details = details ?? []
    }
}

export class BadRequestException extends HttpException {
    constructor(message: string = 'Bad request syntax') {
        super(400, message)
    }
}

export class NotFoundException extends HttpException {
    constructor(message: string = 'Resource not found') {
        super(404, message)
    }
}

export class MethodNotAllowedException extends HttpException {
    constructor(message: string = 'HTTP method not allowed') {
        super(405, message)
    }
}

export class PayloadTooLargeException extends HttpException {
    constructor(message: string = 'Payload too large') {
        super(413, message)
    }
}

export class UnsupportedMediaTypeException extends HttpException {
    constructor(message: string = 'Unsupported media type') {
        super(415, message)
    }
}

export class UnprocessableEntityException extends HttpException {
    constructor(message: string = 'Unprocessable entity', details?: string[]) {
        super(422, message, details)
    }
}

export class InternalServerErrorException extends HttpException {
    constructor(message: string = 'Internal server error') {
        super(500, message)
    }
}
