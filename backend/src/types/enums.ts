export enum StepType {
  FILTER = "filter",
  TRANSFORM = "transform",
  HTTP_REQUEST = "http_request",
}

export enum FilterOperator {
  EQ = "eq",
  NEQ = "neq",
}

export enum TransformOperator {
  DEFAULT = "default",
  TEMPLATE = "template",
  PICK = "pick",
}

export enum HttpBodyMode {
  CTX = "ctx",
  CUSTOM = "custom",
}

export enum HttpMethod {
  GET = "GET",
  POST = "POST",
  PUT = "PUT",
  PATCH = "PATCH",
  DELETE = "DELETE",
}
