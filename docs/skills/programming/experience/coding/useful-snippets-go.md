---
tags:
  - Skill
  - Programming
---

# Useful Snippets in Go

## The most dangerous line in your Go codebase isn’t dangerous because it’s complex. It’s dangerous because it’s too simple, and hides sharp edges.

_(taken from: https://medium.com/@ThreadSafeDiaries/the-most-dangerous-line-in-every-go-codebase-and-why-you-keep-writing-it-2a3f362a2fef)_

```go
go func() {
    // seems innocent
}()
```

### What You Should Be Doing Instead

There’s no shame in using go func() {} if you do it safely.
Let’s go through 4 patterns to use instead of blind fire-and-forget.

#### Pattern 1: Context-Aware Goroutines

```go
func Process(ctx context.Context) {
    go func() {
        select {
        case <-time.After(5 * time.Second):
            fmt.Println("work done")
        case <-ctx.Done():
            fmt.Println("cancelled:", ctx.Err())
        }
    }()
}
```

Always pass the parent context.Context, and respect it using select.

#### Pattern 2: Error Channels for Monitoring

```go
func startWorker() <-chan error {
    errCh := make(chan error, 1)
    go func() {
        defer close(errCh)
        // Do work
        err := doSomething()
        errCh <- err
    }()
    return errCh
}

func main() {
    err := <-startWorker()
    if err != nil {
        log.Println("worker error:", err)
    }
}
```

This lets you bubble errors up and add retries or circuit breakers.

#### Pattern 3: Worker Pools with Backpressure

If you need high concurrency, don’t use unbounded goroutines. Use bounded workers.

```go
var sem = make(chan struct{}, 100) // limit to 100 concurrent tasks
func safeGo(fn func()) {
    sem <- struct{}{}
    go func() {
        defer func() { <-sem }()
        fn()
    }()
}
```

This ensures you don’t overwhelm the system.

#### Pattern 4: Recover from Panics

Wrap your goroutine to handle panics safely:

```go
go func() {
    defer func() {
        if r := recover(); r != nil {
            log.Println("recovered from panic:", r)
        }
    }()
    dangerousOp()
}()
```

Where This Goes Wrong Architecturally
Here’s a typical architecture:

┌──────────────┐
│ API Server │
└──────┬───────┘
│
▼
┌──────────────┐
│ Handler Layer│
└──────┬───────┘
▼
┌────────────────────┐
│ Fire-and-Forget Go │ ← This layer leaks goroutines
└────────────────────┘
Each handler spawns background jobs for audit logs, events, notifications, metrics without coordination.

What should be there instead?

┌──────────────┐
│ API Server │
└──────┬───────┘
▼
┌──────────────┐
│ Handler Layer│
└──────┬───────┘
▼
┌─────────────────────────────┐
│ Worker Pool / Task Queue │ ← Backed by context, retries, observability
└─────────────────────────────┘
Move async tasks to a reliable task executor even chan + select + limited goroutines work. Or externalize with RabbitMQ, Kafka, or even Redis queues if needed.
