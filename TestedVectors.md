# Tested Vectors

This document records security vectors that have been tested and their outcomes.

| Vector | Severity | Status | Notes |
|-------|---------|--------|-------|
| Unauthorized upgrade by non-owner | High | Managed (reverts) | Non-owner upgrade attempt reverted with `Ownable: caller is not the owner` |
