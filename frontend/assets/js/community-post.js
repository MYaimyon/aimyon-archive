const COMMUNITY_POST_BASE = "http://localhost:8080/api/community/posts";

document.addEventListener("DOMContentLoaded", () => {
  const qs = new URLSearchParams(location.search);
  const id = qs.get("id");

  const el = {
    board: document.getElementById("cpBoard"),
    date: document.getElementById("cpDate"),
    title: document.getElementById("cpTitle"),
    author: document.getElementById("cpAuthor"),
    content: document.getElementById("cpContent"),
    comments: document.getElementById("commentList")
  };

  if (!id) {
    el.content.innerHTML = "<p>잘못된 접근입니다. 글 ID가 필요합니다.</p>";
    return;
  }

  const fmtDate = (iso) => {
    if (!iso) return "";
    try {
      const d = new Date(iso);
      return `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, "0")}.${String(
        d.getDate()
      ).padStart(2, "0")}`;
    } catch {
      return iso;
    }
  };

  const loadPost = () =>
    fetch(`${COMMUNITY_POST_BASE}/${encodeURIComponent(id)}`)
      .then((res) => {
        if (!res.ok) throw new Error("post fetch failed");
        return res.json();
      })
      .then((post) => {
        el.board.textContent = `#${post.boardSlug ?? ""}`;
        el.date.textContent = fmtDate(post.createdAt);
        el.title.textContent = post.title || "제목 없음";
        el.author.textContent = `작성자 #${post.userId ?? "-"}`;
        el.content.innerHTML = (post.content || "내용 없음").replace(/\n/g, "<br>");
      })
      .catch(() => {
        el.content.innerHTML = "<p>게시글을 불러오지 못했어요.</p>";
      });

  const loadComments = () => {
    el.comments.innerHTML = '<p style="opacity:.7">댓글을 불러오는 중...</p>';
    fetch(`${COMMUNITY_POST_BASE}/${encodeURIComponent(id)}/comments`)
      .then((res) => {
        if (!res.ok) throw new Error("comments fetch failed");
        return res.json();
      })
      .then((items) => {
        if (!items.length) {
          el.comments.innerHTML =
            '<div class="community-empty" style="margin:0;"><p>아직 댓글이 없어요.</p></div>';
          return;
        }

        el.comments.innerHTML = items
          .map(
            (comment) => `
            <div class="comment-card">
              <div class="comment-meta">
                <span>작성자 #${comment.userId ?? "-"}</span>
                <span>${fmtDate(comment.createdAt)}</span>
              </div>
              <div class="comment-body">${(comment.content || "").replace(/\n/g, "<br>")}</div>
            </div>
          `
          )
          .join("");
      })
      .catch(() => {
        el.comments.innerHTML =
          '<div class="community-empty" style="margin:0;"><p>댓글을 불러오지 못했어요.</p></div>';
      });
  };

  loadPost();
  loadComments();
});
