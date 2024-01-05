import { InitOptions } from '../types/index'
import { _support } from '../utils/index'

export class Breadcrumb {
    bindOptions(options: InitOptions = {}): void {
        const { maxBreadcrumbs, beforePushBreadcrumb } = options
    }
}

const breadcrumb = _support.breadcrumb || (_support.breadcrumb = new Breadcrumb())
export { breadcrumb }