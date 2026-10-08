# Allocate heap for Checkstyle parsing

The GitHub build fails inside Checkstyle's Java parser while reading
`ItemRewriter.java`. The stack trace identifies `OutOfMemoryError: Java heap space`
in ANTLR's full-context prediction. No style violation is reported.

Set each Checkstyle worker's maximum heap to 1 GiB through Gradle's
[Checkstyle task property](https://docs.gradle.org/9.8.0/dsl/org.gradle.api.plugins.quality.Checkstyle.html#org.gradle.api.plugins.quality.Checkstyle:maxHeapSize).
Keep the existing Java launcher, checks, source selection and failure policy.
This changes build resource allocation and has no runtime effect.

## Verification

All 99 patches replay. Fresh main, test and tool Checkstyle tasks pass on the
complete stack. Verbose logs confirm that each of the three workers uses
`-Xmx1g`. The patch also applies alone to the pinned upstream base without setup,
where main and tool Checkstyle tasks pass with the same worker limit.

GitHub runner verification remains pending until the updated build completes.
