import { _support } from '../utils/index'

export class Breadcrumb {

}

const breadcrumb = _support.breadcrumb || (_support.breadcrumb = new Breadcrumb())
export { breadcrumb }