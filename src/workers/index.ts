import { createImageProcessingWorker } from './image-processing.worker'
import { createEmailWorker } from './email.worker'

async function main() {
  console.log('[workers] Starting workers...')

  const imageWorker = createImageProcessingWorker()
  const emailWorker = createEmailWorker()

  console.log('[workers] Image processing worker started')
  console.log('[workers] Email worker started')

  async function shutdown() {
    console.log('[workers] Shutting down gracefully...')
    await Promise.all([imageWorker.close(), emailWorker.close()])
    console.log('[workers] All workers stopped')
    process.exit(0)
  }

  process.on('SIGTERM', shutdown)
  process.on('SIGINT', shutdown)
}

main().catch(err => {
  console.error('[workers] Fatal error:', err)
  process.exit(1)
})
