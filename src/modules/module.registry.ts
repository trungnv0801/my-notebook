import type { AppModule } from './app-module'
import { pdfReaderModule } from './pdf-reader/module.config'
import { recurringTasksModule } from './recurring-tasks/module.config'
import { spacedRepetitionModule } from './spaced-repetition/module.config'

export const appModules: AppModule[] = [spacedRepetitionModule, recurringTasksModule, pdfReaderModule].sort(
  (first, second) => (first.navOrder ?? 0) - (second.navOrder ?? 0)
)
