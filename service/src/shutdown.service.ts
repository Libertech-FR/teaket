import { OnModuleDestroy } from '@nestjs/common'
import { Subject } from 'rxjs'

export class ShutdownService implements OnModuleDestroy {
  private shutdownListener$: Subject<void> = new Subject()

  public onModuleDestroy() {
    console.log('Executing OnDestroy Hook')
  }

  public subscribeToShutdown(shutdownFn: () => void): void {
    this.shutdownListener$.subscribe(() => shutdownFn())
  }

  public shutdown() {
    this.shutdownListener$.next()
  }
}
