import type {SoftNavMechanism} from '@github-ui/soft-nav/events'

export class HPCTimingEvent extends Event {
  name = 'HPC' as const
  value: number

  constructor(
    public soft: boolean,
    public ssr: boolean,
    public lazy: boolean,
    public alternate: boolean,
    public mechanism: SoftNavMechanism | 'hard',
    public found: boolean,
    public gqlFetched: boolean,
    public jsFetched: boolean,
    start: number,
  ) {
    super('hpc:timing')
    this.value = performance.now() - start
  }
}
