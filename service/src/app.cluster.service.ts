import cluster from 'node:cluster'
import * as os from 'node:os'
import { Injectable, Logger } from '@nestjs/common'
import process from 'node:process'

const CLUSTER_DEFAULT_FORKS = os.cpus().length

@Injectable()
export class AppClusterService {
  public static async clusterize(callback: () => Promise<void>): Promise<void> {
    if (!process.env.TK_SERVICE_CLUSTERIZE) {
      await callback()
      return
    }
    if (cluster.isPrimary) {
      const numCPUs = process.env.TK_SERVICE_CLUSTERIZE_FORKS || CLUSTER_DEFAULT_FORKS
      Logger.log(`Master server started on <${process.pid}> with pid <${numCPUs}> forks 🏁`, AppClusterService.name)
      for (let i = 0; i < numCPUs; i++) {
        cluster.fork()
      }
      cluster.on('online', (worker) => {
        Logger.log(`Worker ${worker.process['pid']} starting... 🟠`, AppClusterService.name)
      })
      cluster.on('exit', (worker, code, signal) => {
        Logger.error(`Worker ${worker.process['pid']} died. Restarting`, AppClusterService.name)
        cluster.fork()
      })
    } else {
      Logger.log(`Worker server started on pid <${process.pid}> 🟢`, AppClusterService.name)
      await callback()
    }
  }
}
