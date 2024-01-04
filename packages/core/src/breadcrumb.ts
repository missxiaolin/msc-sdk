import { _support } from '../../utils/src/index'

export class Breadcrumb {

}

const breadcrumb = _support.breadcrumb || (_support.breadcrumb = new Breadcrumb())
export { breadcrumb }