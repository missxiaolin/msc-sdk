import { _support } from '@xiaolin/monitor-utils'

export class Breadcrumb {

}

const breadcrumb = _support.breadcrumb || (_support.breadcrumb = new Breadcrumb())
export { breadcrumb }