# GoGo GitHub-only AI Agent

This is an ephemeral GitHub Actions coding agent. It does not run a VPS, web service, persistent daemon, or paid model API.

## Prototype

- Runtime: temporary GitHub-hosted Ubuntu runner + Docker.
- Model: Qwen/Qwen2.5-Coder-1.5B-Instruct-GGUF, Q4_K_M quantization, through the official llama.cpp server image.
- Model size: approximately 1.12 GB; downloaded during each run.
- Trigger: manual workflow_dispatch only. Untrusted issue/comment events cannot start a write-capable run.
- Output: draft pull request on an isolated ai-agent/run-<run-id> branch. No direct push to the target default branch and no auto-merge.
- Safety: model output is untrusted; patch paths are checked and workflow/secret files are blocked.

The small model is a first-stage coding worker, not a claim of GPT-level autonomous engineering. Benchmark it against real GoGo tasks before expanding permissions.

## Run

1. Open Actions -> GoGo GitHub-only AI Agent -> Run workflow.
2. Set target_repo (for example parya5103/gogo-website), base_ref (usually main), and one bounded task.
3. Review the generated draft PR manually. Never enable auto-merge.

## Cross-repository access

For a target repository other than this control repository, add a fine-grained PAT as repository secret GOGO_AGENT_TOKEN in this control repository. Grant only Contents read/write, Pull requests read/write, and Metadata read-only. Limit the token to the GoGo repositories the agent should access. Without this secret, the workflow can only access this control repository through its own GITHUB_TOKEN.

## Approval gate

Create a GitHub Environment named gogo-ai-agent-approval in repository settings and configure required reviewers. The workflow references this environment before checking out a target repository or running the model. If the environment has no required reviewers, GitHub will not pause for approval.

Allow GitHub Actions to create pull requests if the repository setting blocks PR creation. Do not grant Actions permission to approve PRs.

## Current limits

GitHub-hosted runners are temporary. Every run starts a fresh runner, downloads the model, performs one task, and shuts down. This is not a 24/7 chatbot or persistent agent. Public-repository standard runners are free under GitHub's published Actions policy, subject to fair-use and platform limits.

## Next milestones

1. Prove the container starts and model responds on the hosted runner.
2. Benchmark patch quality on a harmless test issue and inspect generated PRs.
3. Add repository-specific test adapters and context retrieval.
4. Add scheduled read-only audits after the manual path is reliable.
5. Expand to multiple repositories only after the fine-grained token and approval controls are verified.

Never put model weights, PATs, Firebase credentials, .env files, or other secrets in Git.
