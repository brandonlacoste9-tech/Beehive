OWNER ?= brandonlacoste9-tech
REPO  ?= Beehive
BRANCH ?= main
PATH_FILE ?= .github/ISSUE_TEMPLATE/config.yml

# --- Verification Targets ---

verify-config:
    @echo "Previewing first 120 lines of $(PATH_FILE) from $(BRANCH)…"
    gh api repos/$(OWNER)/$(REPO)/contents/$(PATH_FILE)?ref=$(BRANCH) --jq .download_url \
    | xargs curl -s | sed -n '1,120p'

check-link:
    @echo "Checking for Discord link in $(PATH_FILE)…"
    gh api repos/$(OWNER)/$(REPO)/contents/$(PATH_FILE)?ref=$(BRANCH) --jq .download_url \
    | xargs curl -s | grep -Eo 'https://discord\.gg/[A-Za-z0-9]+' || echo "No Discord link found"

latest-commit:
    @echo "Latest commit touching $(PATH_FILE) on $(BRANCH)…"
    gh api repos/$(OWNER)/$(REPO)/commits?path=$(PATH_FILE)\&sha=$(BRANCH) \
    --jq '.[0] | {sha:.sha, msg:.commit.message}'