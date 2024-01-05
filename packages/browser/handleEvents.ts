import { BREADCRUMBTYPES } from '../shared/index'
import { MITOHttp } from '../types/index'

const HandleEvents = {
    handleHttp(data: MITOHttp, type: BREADCRUMBTYPES): void {
        console.log(data)
        console.log(type)
    }
}

export { HandleEvents }