// 모바일 메뉴 토글
const toggle = document.querySelector(".nav-toggle");
const gnb = document.querySelector(".gnb");
if (toggle && gnb) {
  toggle.addEventListener("click", () => {
    gnb.classList.toggle("open");
    toggle.setAttribute("aria-expanded", gnb.classList.contains("open"));
  });
}

// 모바일: 하위메뉴 아코디언 (첫 탭은 펼침, 펼쳐진 상태에서 탭하면 이동)
document.querySelectorAll(".gnb > li").forEach((li) => {
  const drop = li.querySelector(".dropdown");
  if (!drop) return;
  li.classList.add("has-sub");
  const link = li.querySelector(":scope > a");
  link.addEventListener("click", (e) => {
    if (window.innerWidth > 860) return;
    if (!li.classList.contains("sub-open")) {
      e.preventDefault();
      document.querySelectorAll(".gnb > li.sub-open").forEach((o) => {
        if (o !== li) o.classList.remove("sub-open");
      });
      li.classList.add("sub-open");
    }
  });
});

// 스크롤 리빌 (reduced motion 존중)
const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
if (!reduce && "IntersectionObserver" in window) {
  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) {
          e.target.classList.add("in");
          io.unobserve(e.target);
        }
      });
    },
    { threshold: 0, rootMargin: "0px 0px -8% 0px" }
  );
  document.querySelectorAll(".reveal").forEach((el) => io.observe(el));
  // 안전장치: 관찰이 지연되어도 콘텐츠가 숨겨진 채 남지 않도록 함
  setTimeout(() => {
    document.querySelectorAll(".reveal:not(.in)").forEach((el) => el.classList.add("in"));
  }, 2500);
} else {
  document.querySelectorAll(".reveal").forEach((el) => el.classList.add("in"));
}

// 공유하기 버튼: 모바일은 공유 시트(문자·카카오톡), PC는 링크 복사
function showToast(text) {
  let toast = document.querySelector(".toast");
  if (!toast) {
    toast = document.createElement("div");
    toast.className = "toast";
    document.body.appendChild(toast);
  }
  toast.textContent = text;
  toast.classList.add("show");
  clearTimeout(toast._t);
  toast._t = setTimeout(() => toast.classList.remove("show"), 2600);
}

document.querySelectorAll(".share-btn").forEach((btn) => {
  btn.addEventListener("click", async () => {
    const shareData = {
      title: document.title,
      text: document.title,
      url: location.href,
    };
    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch (e) {
        /* 사용자가 공유 시트를 닫은 경우 */
      }
      return;
    }
    try {
      await navigator.clipboard.writeText(location.href);
      showToast("링크가 복사되었습니다. 문자나 카카오톡에 붙여넣어 공유하세요.");
    } catch (e) {
      window.prompt("아래 링크를 복사해 공유하세요.", location.href);
    }
  });
});

// 상담 폼: 구글시트 기록 + 관리자 메일 발송 (Apps Script 웹앱)
const CONSULT_ENDPOINT = "https://script.google.com/macros/s/AKfycbzSbTHYkgkR6OU6KStWOex3qAQAvyS7Om8VYtsODXTPoCAIvMkiXkDz25sZKCKHAQthbA/exec";
const form = document.querySelector("#consult-form");
if (form) {
  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const msg = form.querySelector(".form-msg");
    const btn = form.querySelector('button[type="submit"]');
    const show = (text) => {
      if (msg) {
        msg.style.display = "block";
        msg.textContent = text;
      }
    };
    if (CONSULT_ENDPOINT) {
      if (btn) btn.disabled = true;
      show("접수 중입니다...");
      try {
        const data = new URLSearchParams(new FormData(form));
        await fetch(CONSULT_ENDPOINT, { method: "POST", mode: "no-cors", body: data });
        show("상담 신청이 접수되었습니다. 영업일 기준 1일 이내에 연락드리겠습니다.");
        form.reset();
      } catch (err) {
        show("일시적인 오류로 접수에 실패했습니다. 전화로 문의해 주세요.");
      } finally {
        if (btn) btn.disabled = false;
      }
    } else {
      show("상담 신청이 접수되었습니다. 영업일 기준 1일 이내에 연락드리겠습니다.");
      form.reset();
    }
  });
}
