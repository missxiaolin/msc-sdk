import { Severity } from '../shared'
import { VueInstance, ViewModel } from './types'

export function handleVueError(
  err: Error,
  vm: ViewModel,
  info: string,
  level: Severity,
  Vue: VueInstance
): void {
    console.log(err, vm, info, level, Vue)
}
