"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import StatusBar from "@/components/StatusBar";
import CommandInput from "@/components/CommandInput";
import MenuItem from "@/components/MenuItem";

// ===== Types =====
interface ApiPost {
  id: number;
  title: string;
  author: string;
  authorId: number;
  date: string;
  views: number;
  content: string;
  isNotice: boolean;
  commentCount?: number;
  comments?: ApiComment[];
}

interface ApiComment {
  id: number;
  content: string;
  author: string;
  authorId: number;
  date: string;
}

interface User {
  id: number;
  username: string;
  nickname: string;
  isAdmin: boolean;
}

// ===== Screen Types =====
type Screen =
  | { type: "main" }
  | { type: "board"; boardId: string; page: number }
  | { type: "post"; postId: number }
  | { type: "write"; boardId: string }
  | { type: "help" }
  | { type: "about" }
  | { type: "login" }
  | { type: "login" }
  | { type: "signup" }
  | { type: "terms" }
  | { type: "myinfo" };

const POSTS_PER_PAGE = 10;

export default function Home() {
  const [screen, setScreen] = useState<Screen>({ type: "main" });
  const [writeTitle, setWriteTitle] = useState("");
  const [writeContent, setWriteContent] = useState("");
  const [notification, setNotification] = useState("");
  const contentRef = useRef<HTMLDivElement>(null);

  // Auth state
  const [user, setUser] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState(true);

  // Dimmed mode state
  const [dimmed, setDimmed] = useState(false);
  useEffect(() => {
    const saved = localStorage.getItem("hicomm-dimmed");
    if (saved === "true") setDimmed(true);
  }, []);
  const toggleDimmed = useCallback(() => {
    setDimmed((prev) => {
      const next = !prev;
      localStorage.setItem("hicomm-dimmed", String(next));
      return next;
    });
  }, []);

  // Board data state
  const [boardPosts, setBoardPosts] = useState<ApiPost[]>([]);
  const [boardTotal, setBoardTotal] = useState(0);
  const [boardTotalPages, setBoardTotalPages] = useState(1);

  // Post detail state
  const [currentPost, setCurrentPost] = useState<ApiPost | null>(null);

  // ===== Auth: Check session on mount =====
  useEffect(() => {
    fetch("/api/auth/me")
      .then((r) => r.json())
      .then((data) => setUser(data.user))
      .catch(() => setUser(null))
      .finally(() => setAuthLoading(false));
  }, []);

  // Auto-scroll to top on screen change
  useEffect(() => {
    contentRef.current?.scrollTo(0, 0);
  }, [screen]);

  // Notification auto-dismiss
  useEffect(() => {
    if (notification) {
      const t = setTimeout(() => setNotification(""), 3000);
      return () => clearTimeout(t);
    }
  }, [notification]);

  // ===== Fetch board posts when entering board screen =====
  useEffect(() => {
    if (screen.type === "board") {
      fetch(`/api/posts?boardId=${screen.boardId}&page=${screen.page}&limit=${POSTS_PER_PAGE}`)
        .then((r) => r.json())
        .then((data) => {
          setBoardPosts(data.posts);
          setBoardTotal(data.total);
          setBoardTotalPages(data.totalPages);
        })
        .catch(() => setNotification("게시글 목록을 불러올 수 없습니다."));
    }
  }, [screen]);

  // ===== Fetch post detail when entering post screen =====
  useEffect(() => {
    if (screen.type === "post") {
      setCurrentPost(null);
      fetch(`/api/posts/${screen.postId}`)
        .then((r) => r.json())
        .then((data) => setCurrentPost(data))
        .catch(() => setNotification("게시글을 불러올 수 없습니다."));
    }
  }, [screen]);

  // ===== Auth Handlers =====
  const handleLogin = useCallback(async (username: string, password: string) => {
    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
    });
    const data = await res.json();
    if (res.ok) {
      setUser(data.user);
      setNotification(`환영합니다, ${data.user.nickname}님!`);
      setScreen({ type: "main" });
    } else {
      setNotification(data.error || "로그인 실패");
    }
  }, []);

  const handleSignup = useCallback(async (username: string, password: string, nickname: string) => {
    const res = await fetch("/api/auth/signup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password, nickname }),
    });
    const data = await res.json();
    if (res.ok) {
      setUser(data.user);
      setNotification(`가입 완료! 환영합니다, ${data.user.nickname}님!`);
      setScreen({ type: "main" });
    } else {
      setNotification(data.error || "회원가입 실패");
    }
  }, []);

  const handleLogout = useCallback(async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    setUser(null);
    setNotification("로그아웃 되었습니다.");
    setScreen({ type: "main" });
  }, []);

  const handleWithdraw = useCallback(async () => {
    if (!confirm("정말로 탈퇴하시겠습니까? \n탈퇴 시 작성한 글과 댓글은 '탈퇴한 회원'으로 표시되며 복구할 수 없습니다.")) {
      return;
    }
    const res = await fetch("/api/auth/withdraw", { method: "DELETE" });
    if (res.ok) {
      setUser(null);
      setNotification("회원 탈퇴가 완료되었습니다. 이용해 주셔서 감사합니다.");
      setScreen({ type: "main" });
    } else {
      setNotification("탈퇴 처리에 실패했습니다.");
    }
  }, []);

  // ===== Post/Comment Handlers =====
  const deletePost = useCallback(async (postId: number) => {
    const res = await fetch(`/api/posts/${postId}`, { method: "DELETE" });
    if (res.ok) {
      setNotification("✓ 게시글이 삭제되었습니다.");
      setScreen({ type: "board", boardId: "free", page: 1 });
    } else {
      const data = await res.json();
      setNotification(data.error || "삭제 실패");
    }
  }, []);

  const deleteComment = useCallback(async (commentId: number) => {
    const res = await fetch(`/api/comments/${commentId}`, { method: "DELETE" });
    if (res.ok) {
      setNotification("✓ 댓글이 삭제되었습니다.");
      // Refresh current post
      if (screen.type === "post") {
        const postRes = await fetch(`/api/posts/${screen.postId}`);
        const data = await postRes.json();
        setCurrentPost(data);
      }
    } else {
      const data = await res.json();
      setNotification(data.error || "삭제 실패");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [screen]);

  const addComment = useCallback(async (postId: number, content: string) => {
    if (!user) {
      setNotification("로그인이 필요합니다.");
      return;
    }
    const res = await fetch("/api/comments", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ postId, content }),
    });
    if (res.ok) {
      setNotification("✓ 댓글이 등록되었습니다.");
      // Refresh current post
      const postRes = await fetch(`/api/posts/${postId}`);
      const data = await postRes.json();
      setCurrentPost(data);
    } else {
      const data = await res.json();
      setNotification(data.error || "댓글 등록 실패");
    }
  }, [user]);

  const addPost = useCallback(async (boardId: string, title: string, content: string) => {
    if (!user) {
      setNotification("로그인이 필요합니다.");
      return;
    }
    const res = await fetch("/api/posts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ boardId, title, content }), // isNotice defaults to false
    });
    if (res.ok) {
      setNotification("✓ 글이 등록되었습니다!");
      setScreen({ type: "board", boardId, page: 1 });
    } else {
      const data = await res.json();
      setNotification(data.error || "글 등록 실패");
    }
  }, [user]);

  const toggleNotice = useCallback(async (postId: number, isNotice: boolean) => {
    if (!user || !user.isAdmin) return;
    const res = await fetch(`/api/posts/${postId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isNotice }),
    });
    if (res.ok) {
      setNotification(isNotice ? "★ 공지로 등록되었습니다." : "✓ 공지가 해제되었습니다.");
      // Refresh current post if viewing it
      if (screen.type === "post" && screen.postId === postId) {
        const postRes = await fetch(`/api/posts/${postId}`);
        const data = await postRes.json();
        setCurrentPost(data);
      }
      // Refresh board if viewing it (not strictly needed as it re-fetches on nav, but useful if we stay)
    } else {
      setNotification("공지 설정 실패");
    }
  }, [user, screen]);

  // ===== Command Handler =====
  const handleCommand = useCallback(
    (cmd: string) => {
      const c = cmd.toLowerCase().trim();

      // Global navigation
      if (c === "m" || c === "메인" || c === "홈") {
        setScreen({ type: "main" });
        return;
      }
      if (c === "b" || c === "뒤로" || c === "back") {
        goBack();
        return;
      }
      if (c === "h" || c === "도움" || c === "help" || c === "?") {
        setScreen({ type: "help" });
        return;
      }
      if (c === "terms" || c === "약관" || c === "이용약관" || c === "4") {
        setScreen({ type: "terms" });
        return;
      }
      if (c === "login" || c === "로그인") {
        if (user) {
          setNotification("이미 로그인되어 있습니다.");
        } else {
          setScreen({ type: "login" });
        }
        return;
      }
      if (c === "signup" || c === "회원가입" || c === "가입") {
        if (user) {
          setNotification("이미 로그인되어 있습니다.");
        } else {
          setScreen({ type: "signup" });
        }
        return;
      }
      if (c === "logout" || c === "로그아웃") {
        handleLogout();
        return;
      }

      // Context-specific commands
      switch (screen.type) {
        case "main": {
          if (c === "1" || c === "게시판" || c === "자유게시판") {
            setScreen({ type: "board", boardId: "free", page: 1 });
          } else if (c === "2" || c === "안내" || c === "소개") {
            setScreen({ type: "about" });
          } else if (c === "3" || c === "도움" || c === "도움말") {
            setScreen({ type: "help" });
          } else if (c === "4" || c === "약관") {
            setScreen({ type: "terms" });
          } else {
            setNotification(`알 수 없는 명령어: "${cmd}" (도움말: H)`);
          }
          break;
        }
        case "board": {
          if (c === "n" || c === "다음") {
            if (screen.page < boardTotalPages)
              setScreen({ ...screen, page: screen.page + 1 });
            else setNotification("마지막 페이지입니다.");
          } else if (c === "p" || c === "이전") {
            if (screen.page > 1)
              setScreen({ ...screen, page: screen.page - 1 });
            else setNotification("첫 번째 페이지입니다.");
          } else if (c === "w" || c === "글쓰기" || c === "write") {
            if (!user) {
              setNotification("로그인이 필요합니다. (로그인: login)");
            } else {
              setScreen({ type: "write", boardId: screen.boardId });
            }
          } else {
            const num = parseInt(c);
            if (!isNaN(num)) {
              setScreen({ type: "post", postId: num });
            } else {
              setNotification(`알 수 없는 명령어: "${cmd}"`);
            }
          }
          break;
        }
        case "post": {
          if (c === "l" || c === "목록" || c === "list") {
            setScreen({ type: "board", boardId: "free", page: 1 });
          } else {
            setNotification(`"L"=목록, "B"=뒤로, "M"=메인`);
          }
          break;
        }
        default:
          setNotification(`알 수 없는 명령어: "${cmd}"`);
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [screen, user, boardTotalPages]
  );

  const goBack = useCallback(() => {
    switch (screen.type) {
      case "board":
        setScreen({ type: "main" });
        break;
      case "post":
        setScreen({ type: "board", boardId: "free", page: 1 });
        break;
      case "write":
        setScreen({ type: "board", boardId: "free", page: 1 });
        break;
      case "login":
      case "signup":
      case "help":
      case "about":
        setScreen({ type: "main" });
        break;
      default:
        break;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [screen]);

  if (authLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-black">
        <div className="text-terminal-cyan animate-pulse">접속 중...</div>
      </div>
    );
  }

  // ===== Render =====
  return (
    <div className={`flex items-center justify-center min-h-screen bg-black ${dimmed ? "dimmed" : ""}`}>
      <div className={`flex flex-col h-screen-safe w-full max-w-4xl border-x-2 ${dimmed ? "bg-black border-gray-800" : "bg-terminal-bg border-terminal-border"}`}>
        <StatusBar nickname={user?.nickname || null} dimmed={dimmed} onToggleDimmed={toggleDimmed} />

        {/* Notification Toast */}
        {notification && (
          <div className="px-3 py-1.5 bg-terminal-red text-terminal-text text-sm text-center animate-fade-in">
            {notification}
          </div>
        )}

        {/* Main Content Area */}
        <main
          ref={contentRef}
          className="flex-1 overflow-y-auto px-4 sm:px-8 py-4"
        >
          {screen.type === "main" && <MainMenuScreen onNavigate={setScreen} user={user} />}
          {screen.type === "board" && (
            <BoardScreen
              boardId={screen.boardId}
              page={screen.page}
              onNavigate={setScreen}
              posts={boardPosts}
              totalPages={boardTotalPages}
              total={boardTotal}
              isAdmin={user?.isAdmin || false}
              onDeletePost={deletePost}
            />
          )}
          {screen.type === "post" && (
            currentPost ? (
              <PostScreen
                post={currentPost}
                onNavigate={setScreen}
                user={user}
                onDeletePost={deletePost}
                onDeleteComment={deleteComment}
                onAddComment={addComment}
                onToggleNotice={toggleNotice}
              />
            ) : (
              <div className="text-terminal-cyan animate-pulse py-8 text-center">
                글 불러오는 중...
              </div>
            )
          )}
          {screen.type === "write" && (
            <WriteScreen
              boardId={screen.boardId}
              onNavigate={setScreen}
              writeTitle={writeTitle}
              setWriteTitle={setWriteTitle}
              writeContent={writeContent}
              setWriteContent={setWriteContent}
              onAddPost={addPost}
            />
          )}
          {screen.type === "login" && (
            <LoginScreen onLogin={handleLogin} onNavigate={setScreen} />
          )}
          {screen.type === "signup" && (
            <SignupScreen onSignup={handleSignup} onNavigate={setScreen} />
          )}
          {screen.type === "help" && <HelpScreen user={user} />}
          {screen.type === "about" && <AboutScreen />}
          {screen.type === "terms" && <TermsScreen onBack={() => setScreen({ type: "main" })} />}
          {screen.type === "myinfo" && user && (
            <MyInfoScreen
              user={user}
              onLogout={handleLogout}
              onWithdraw={handleWithdraw}
              onBack={() => setScreen({ type: "main" })}
            />
          )}
        </main>

        <CommandInput onCommand={handleCommand} isAdmin={user?.isAdmin || false} dimmed={dimmed} />
      </div>
    </div>
  );
}

// ========================================
// Sub-screens
// ========================================

function Divider() {
  return (
    <div className="border-t border-terminal-border my-2 opacity-50" />
  );
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="text-terminal-cyan font-bold text-center py-2 tracking-widest">
      {children}
    </h2>
  );
}

// ===== Main Menu =====
function MainMenuScreen({
  onNavigate,
  user,
}: {
  onNavigate: (s: Screen) => void;
  user: User | null;
}) {
  return (
    <div className="animate-fade-in">
      <div className="text-center py-4">
        {/* Desktop ASCII art */}
        <pre className="text-terminal-cyan text-sm leading-tight hidden sm:inline-block">
          {`
 ██╗  ██╗██╗ ██████╗ ██████╗ ███╗   ███╗███╗   ███╗
 ██║  ██║██║██╔════╝██╔═══██╗████╗ ████║████╗ ████║
 ███████║██║██║     ██║   ██║██╔████╔██║██╔████╔██║
 ██╔══██║██║██║     ██║   ██║██║╚██╔╝██║██║╚██╔╝██║
 ██║  ██║██║╚██████╗╚██████╔╝██║ ╚═╝ ██║██║ ╚═╝ ██║
 ╚═╝  ╚═╝╚═╝ ╚═════╝ ╚═════╝ ╚═╝     ╚═╝╚═╝     ╚═╝
`}
        </pre>
        {/* Mobile compact logo */}
        <div className="sm:hidden">
          <p className="text-terminal-cyan text-xl font-bold tracking-widest">★ HiComm ★</p>
          <p className="text-terminal-cyan text-xs">하 이 컴</p>
        </div>
        <p className="text-terminal-highlight text-sm mt-2">
          (주)하이시어 정보통신 서비스
        </p>
        <p className="text-terminal-gray text-xs mt-1">
          {user ? `접속자: ${user.nickname}` : "비회원 접속 중 — 로그인: login / 가입: signup"}
        </p>
      </div>

      <Divider />

      <div className="space-y-1">
        <MenuItem number="1" label="자유게시판" onClick={() => onNavigate({ type: "board", boardId: "free", page: 1 })} />
        <MenuItem number="2" label="하이컴 안내" onClick={() => onNavigate({ type: "about" })} />
        <MenuItem number="3" label="도움말" onClick={() => onNavigate({ type: "help" })} />
        <MenuItem number="4" label="이용약관" onClick={() => onNavigate({ type: "terms" })} />
        {user && (
          <MenuItem number="5" label="내 정보" onClick={() => onNavigate({ type: "myinfo" })} />
        )}
      </div>

      <Divider />

      {!user ? (
        <div className="flex gap-4 text-sm">
          <button
            onClick={() => onNavigate({ type: "login" })}
            className="text-terminal-green hover:text-terminal-highlight"
          >
            [로그인]
          </button>
          <button
            onClick={() => onNavigate({ type: "signup" })}
            className="text-terminal-cyan hover:text-terminal-highlight"
          >
            [회원가입]
          </button>
        </div>
      ) : (
        <p className="text-terminal-gray text-sm">
          ※ {user.nickname}님으로 접속 중입니다.
          {user.isAdmin && <span className="text-terminal-red ml-2">[관리자]</span>}
        </p>
      )}
    </div>
  );
}

// ===== Login Screen =====
function LoginScreen({
  onLogin,
  onNavigate,
}: {
  onLogin: (username: string, password: string) => void;
  onNavigate: (s: Screen) => void;
}) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!username.trim() || !password.trim()) return;
    onLogin(username.trim(), password.trim());
  };

  return (
    <div className="animate-fade-in">
      <SectionTitle>═══ 로 그 인 ═══</SectionTitle>
      <Divider />

      <form onSubmit={handleSubmit} className="flex flex-col gap-4 my-4 max-w-sm">
        <div>
          <label className="text-terminal-cyan text-sm block mb-1">아이디:</label>
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="아이디를 입력하세요"
            className="w-full bg-terminal-bg-dark border border-terminal-border text-terminal-text px-3 py-2 font-[inherit] outline-none focus:border-terminal-cyan placeholder:text-terminal-darkgray"
            autoFocus
          />
        </div>
        <div>
          <label className="text-terminal-cyan text-sm block mb-1">비밀번호:</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="비밀번호를 입력하세요"
            className="w-full bg-terminal-bg-dark border border-terminal-border text-terminal-text px-3 py-2 font-[inherit] outline-none focus:border-terminal-cyan placeholder:text-terminal-darkgray"
          />
        </div>

        <Divider />

        <div className="flex gap-4 text-sm">
          <button
            type="submit"
            className="text-terminal-green hover:text-terminal-highlight font-bold"
          >
            [접속]
          </button>
          <button
            type="button"
            onClick={() => onNavigate({ type: "signup" })}
            className="text-terminal-cyan hover:text-terminal-highlight"
          >
            [회원가입]
          </button>
          <button
            type="button"
            onClick={() => onNavigate({ type: "main" })}
            className="text-terminal-red hover:text-terminal-highlight"
          >
            [취소]
          </button>
        </div>
      </form>
    </div>
  );
}

// ===== Signup Screen =====
function SignupScreen({
  onSignup,
  onNavigate,
}: {
  onSignup: (username: string, password: string, nickname: string) => void;
  onNavigate: (s: Screen) => void;
}) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [nickname, setNickname] = useState("");
  const [agreed, setAgreed] = useState(false);
  const [showTerms, setShowTerms] = useState(false);

  const handleSubmit = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!username.trim() || !password.trim() || !nickname.trim()) return;
    if (!agreed) return;
    onSignup(username.trim(), password.trim(), nickname.trim());
  };

  if (showTerms) {
    return <TermsScreen onBack={() => setShowTerms(false)} />;
  }

  return (
    <div className="animate-fade-in">
      <SectionTitle>═══ 회 원 가 입 ═══</SectionTitle>
      <Divider />

      <form onSubmit={handleSubmit} className="flex flex-col gap-4 my-4 max-w-sm">
        <div>
          <label className="text-terminal-cyan text-sm block mb-1">아이디 (3~20자):</label>
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="아이디를 입력하세요"
            className="w-full bg-terminal-bg-dark border border-terminal-border text-terminal-text px-3 py-2 font-[inherit] outline-none focus:border-terminal-cyan placeholder:text-terminal-darkgray"
            autoFocus
          />
        </div>
        <div>
          <label className="text-terminal-cyan text-sm block mb-1">비밀번호 (4자 이상):</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="비밀번호를 입력하세요"
            className="w-full bg-terminal-bg-dark border border-terminal-border text-terminal-text px-3 py-2 font-[inherit] outline-none focus:border-terminal-cyan placeholder:text-terminal-darkgray"
          />
        </div>
        <div>
          <label className="text-terminal-cyan text-sm block mb-1">닉네임:</label>
          <input
            type="text"
            value={nickname}
            onChange={(e) => setNickname(e.target.value)}
            placeholder="닉네임을 입력하세요"
            className="w-full bg-terminal-bg-dark border border-terminal-border text-terminal-text px-3 py-2 font-[inherit] outline-none focus:border-terminal-cyan placeholder:text-terminal-darkgray"
          />
        </div>

        {/* Terms Checkbox */}
        <div className="bg-terminal-bg-dark border border-terminal-border p-3">
          <div className="flex items-start gap-2">
            <input
              type="checkbox"
              id="terms"
              checked={agreed}
              onChange={(e) => setAgreed(e.target.checked)}
              className="mt-1"
            />
            <label htmlFor="terms" className="text-sm text-terminal-gray select-none leading-tight">
              <span className="text-terminal-highlight font-bold">(필수)</span> 이용약관 및 데이터 활용 동의
              <div className="text-xs text-terminal-darkgray mt-1">
                본 서비스 데이터는 모의 주식 시뮬레이터의 분석 데이터로 활용될 수 있습니다. (개인정보 제외)
              </div>
              <button
                type="button"
                onClick={() => setShowTerms(true)}
                className="text-terminal-cyan hover:underline text-xs mt-2"
              >
                [약관 전문 보기]
              </button>
            </label>
          </div>
        </div>

        <Divider />

        <div className="flex gap-4 text-sm">
          <button
            type="submit"
            disabled={!username || !password || !nickname || !agreed}
            className={`font-bold transition-colors ${!username || !password || !nickname || !agreed
              ? "text-terminal-darkgray cursor-not-allowed"
              : "text-terminal-green hover:text-terminal-highlight"
              }`}
          >
            [가입]
          </button>
          <button
            type="button"
            onClick={() => onNavigate({ type: "login" })}
            className="text-terminal-cyan hover:text-terminal-highlight"
          >
            [로그인]
          </button>
          <button
            type="button"
            onClick={() => onNavigate({ type: "main" })}
            className="text-terminal-red hover:text-terminal-highlight"
          >
            [취소]
          </button>
        </div>
      </form>
    </div>
  );
}

// ===== Board View =====
function BoardScreen({
  boardId,
  page,
  onNavigate,
  posts,
  totalPages,
  total,
  isAdmin,
  onDeletePost,
}: {
  boardId: string;
  page: number;
  onNavigate: (s: Screen) => void;
  posts: ApiPost[];
  totalPages: number;
  total: number;
  isAdmin: boolean;
  onDeletePost: (id: number) => void;
}) {
  const boardName = boardId === "free" ? "자유게시판" : boardId;

  return (
    <div className="animate-fade-in">
      <SectionTitle>
        ═══ {boardName} ═══
      </SectionTitle>
      <p className="text-terminal-gray text-sm mb-2">
        전체 {total}건 | {page}/{totalPages} 페이지
      </p>
      <Divider />

      {/* Table Header */}
      <div className="grid grid-cols-[3rem_1fr_5rem_4.5rem] sm:grid-cols-[3rem_1fr_6rem_5rem_3rem] gap-1 text-terminal-cyan font-bold text-sm py-1 border-b border-terminal-border">
        <span>번호</span>
        <span>제목</span>
        <span className="hidden sm:block">글쓴이</span>
        <span>날짜</span>
        <span className="hidden sm:block text-right">조회</span>
      </div>

      {/* Posts */}
      {posts.length === 0 ? (
        <div className="py-4 text-terminal-gray text-center">
          등록된 글이 없습니다.
        </div>
      ) : (
        posts.map((post) => (
          <div key={post.id} className="flex items-center">
            <button
              onClick={() => onNavigate({ type: "post", postId: post.id })}
              className={`flex-1 grid grid-cols-[3rem_1fr_5rem_4.5rem] sm:grid-cols-[3rem_1fr_6rem_5rem_3rem] gap-1 text-sm py-1.5 hover:bg-terminal-selection hover:text-terminal-highlight transition-colors text-left ${post.isNotice ? "font-bold text-terminal-cyan" : ""}`}
            >
              <span className="text-terminal-highlight">
                {post.isNotice ? <span className="text-terminal-red">★</span> : post.id}
              </span>
              <span className="truncate">
                {post.isNotice && <span className="text-terminal-red mr-1">[공지]</span>}
                {post.title}
                {(post.commentCount ?? 0) > 0 && (
                  <span className="text-terminal-cyan ml-1">[{post.commentCount}]</span>
                )}
              </span>
              <span className="text-terminal-gray hidden sm:block truncate">
                {post.author}
              </span>
              <span className="text-terminal-gray text-xs sm:text-sm">
                {post.date.slice(5)}
              </span>
              <span className="text-terminal-darkgray hidden sm:block text-right">
                {post.views}
              </span>
            </button>
            {isAdmin && (
              <button
                onClick={() => onDeletePost(post.id)}
                className="text-terminal-red hover:text-terminal-highlight text-xs px-1 shrink-0"
                title="삭제"
              >
                [X]
              </button>
            )}
          </div>
        ))
      )}

      <Divider />

      {/* Pagination & Actions */}
      <div className="flex flex-wrap items-center justify-between gap-2 text-sm">
        <div className="flex gap-3">
          <button
            onClick={() =>
              page > 1 &&
              onNavigate({ type: "board", boardId, page: page - 1 })
            }
            className={`${page <= 1 ? "text-terminal-darkgray" : "text-terminal-cyan hover:text-terminal-highlight"}`}
            disabled={page <= 1}
          >
            [P] 이전
          </button>
          <span className="text-terminal-gray">
            {page}/{totalPages}
          </span>
          <button
            onClick={() =>
              page < totalPages &&
              onNavigate({ type: "board", boardId, page: page + 1 })
            }
            className={`${page >= totalPages ? "text-terminal-darkgray" : "text-terminal-cyan hover:text-terminal-highlight"}`}
            disabled={page >= totalPages}
          >
            [N] 다음
          </button>
        </div>
        <button
          onClick={() => onNavigate({ type: "write", boardId })}
          className="text-terminal-green hover:text-terminal-highlight"
        >
          [W] 글쓰기
        </button>
      </div>

      <p className="text-terminal-gray text-sm mt-2">
        ※ 글 번호를 입력하면 해당 글을 읽습니다. 뒤로: B
      </p>
    </div>
  );
}

// ===== Post View =====
function PostScreen({
  post,
  onNavigate,
  user,
  onDeletePost,
  onDeleteComment,
  onAddComment,
  onToggleNotice,
}: {
  post: ApiPost;
  onNavigate: (s: Screen) => void;
  user: User | null;
  onDeletePost: (id: number) => void;
  onDeleteComment: (id: number) => void;
  onAddComment: (postId: number, content: string) => void;
  onToggleNotice: (id: number, isNotice: boolean) => void;
}) {
  const [commentInput, setCommentInput] = useState("");
  const comments = post.comments || [];
  const isAdmin = user?.isAdmin || false;
  const canDelete = isAdmin || (user && user.id === post.authorId);

  const handleCommentSubmit = () => {
    if (!commentInput.trim()) return;
    if (!user) return;
    onAddComment(post.id, commentInput.trim());
    setCommentInput("");
  };

  return (
    <div className="animate-fade-in">
      <SectionTitle>═══ 글 읽 기 ═══</SectionTitle>
      <Divider />

      <div className="mb-4">
        <div className="text-terminal-cyan text-sm mb-1">
          [자유게시판] #{post.id} {post.isNotice && <span className="text-terminal-red font-bold">[공지]</span>}
        </div>
        <h3 className="text-terminal-highlight font-bold text-lg mb-1">
          {post.title}
        </h3>
        <div className="flex flex-wrap gap-3 text-terminal-gray text-sm">
          <span>글쓴이: {post.author}</span>
          <span>날짜: {post.date}</span>
          <span>조회: {post.views}</span>
        </div>
      </div>

      <Divider />

      <div className="whitespace-pre-wrap leading-relaxed py-3 text-terminal-text">
        {post.content}
      </div>

      <Divider />

      {/* ===== Comments Section ===== */}
      <div className="mt-2">
        <p className="text-terminal-cyan font-bold text-sm mb-2">
          ▶ 댓글 ({comments.length})
        </p>

        {comments.length === 0 ? (
          <p className="text-terminal-darkgray text-sm py-2">아직 댓글이 없습니다.</p>
        ) : (
          <div className="space-y-2">
            {comments.map((c) => (
              <div key={c.id} className="border-l-2 border-terminal-border pl-3 py-1">
                <div className="flex items-center gap-2 text-sm">
                  <span className="text-terminal-highlight">{c.author}</span>
                  <span className="text-terminal-darkgray">{c.date}</span>
                  {(isAdmin || (user && user.id === c.authorId)) && (
                    <button
                      onClick={() => onDeleteComment(c.id)}
                      className="text-terminal-red hover:text-terminal-highlight text-xs"
                    >
                      [삭제]
                    </button>
                  )}
                </div>
                <p className="text-terminal-text text-sm mt-0.5">{c.content}</p>
              </div>
            ))}
          </div>
        )}

        {/* Comment Input */}
        {user ? (
          <div className="mt-3 flex gap-2">
            <input
              type="text"
              value={commentInput}
              onChange={(e) => setCommentInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleCommentSubmit()}
              placeholder="댓글을 입력하세요..."
              className="flex-1 bg-terminal-bg-dark border border-terminal-border text-terminal-text px-3 py-1.5 text-sm font-[inherit] outline-none focus:border-terminal-cyan placeholder:text-terminal-darkgray"
            />
            <button
              onClick={handleCommentSubmit}
              className="text-terminal-green hover:text-terminal-highlight text-sm px-3 py-1.5 border border-terminal-border hover:border-terminal-cyan transition-colors"
            >
              등록
            </button>
          </div>
        ) : (
          <p className="text-terminal-darkgray text-sm mt-3">
            댓글을 작성하려면 로그인하세요. (명령어: login)
          </p>
        )}
      </div>

      <Divider />

      <div className="flex gap-4 text-sm">
        <button
          onClick={() => onNavigate({ type: "board", boardId: "free", page: 1 })}
          className="text-terminal-cyan hover:text-terminal-highlight"
        >
          [L] 목록
        </button>
        <button
          onClick={() => onNavigate({ type: "main" })}
          className="text-terminal-cyan hover:text-terminal-highlight"
        >
          [M] 메인
        </button>
        {isAdmin && (
          <button
            onClick={() => onToggleNotice(post.id, !post.isNotice)}
            className="text-terminal-yellow hover:text-terminal-highlight"
          >
            {post.isNotice ? "[P] 공지해제" : "[P] 공지등록"}
          </button>
        )}
        {canDelete && (
          <button
            onClick={() => onDeletePost(post.id)}
            className="text-terminal-red hover:text-terminal-highlight"
          >
            [D] 글삭제
          </button>
        )}
      </div>
    </div>
  );
}

// ===== Write Screen =====
function WriteScreen({
  boardId,
  onNavigate,
  writeTitle,
  setWriteTitle,
  writeContent,
  setWriteContent,
  onAddPost,
}: {
  boardId: string;
  onNavigate: (s: Screen) => void;
  writeTitle: string;
  setWriteTitle: (v: string) => void;
  writeContent: string;
  setWriteContent: (v: string) => void;
  onAddPost: (boardId: string, title: string, content: string) => void;
}) {
  const boardName = boardId === "free" ? "자유게시판" : boardId;

  const handleSubmit = () => {
    if (!writeTitle.trim() || !writeContent.trim()) {
      return;
    }
    onAddPost(boardId, writeTitle.trim(), writeContent.trim());
    setWriteTitle("");
    setWriteContent("");
  };

  return (
    <div className="animate-fade-in">
      <SectionTitle>═══ 글 쓰 기 ═══</SectionTitle>
      <p className="text-terminal-gray text-sm mb-2">
        게시판: {boardName}
      </p>
      <Divider />

      <div className="flex flex-col gap-4 my-4">
        <div>
          <label className="text-terminal-cyan text-sm block mb-1">제목:</label>
          <input
            type="text"
            value={writeTitle}
            onChange={(e) => setWriteTitle(e.target.value)}
            placeholder="제목을 입력하세요"
            className="w-full bg-terminal-bg-dark border border-terminal-border text-terminal-text px-3 py-2 font-[inherit] outline-none focus:border-terminal-cyan placeholder:text-terminal-darkgray"
          />
        </div>
        <div>
          <label className="text-terminal-cyan text-sm block mb-1">내용:</label>
          <textarea
            value={writeContent}
            onChange={(e) => setWriteContent(e.target.value)}
            placeholder="내용을 입력하세요"
            rows={10}
            className="w-full bg-terminal-bg-dark border border-terminal-border text-terminal-text px-3 py-2 font-[inherit] outline-none focus:border-terminal-cyan placeholder:text-terminal-darkgray resize-y"
          />
        </div>
      </div>

      <Divider />

      <div className="flex gap-4 text-sm">
        <button
          onClick={handleSubmit}
          className="text-terminal-green hover:text-terminal-highlight font-bold"
        >
          [S] 등록하기
        </button>
        <button
          onClick={() => {
            setWriteTitle("");
            setWriteContent("");
            onNavigate({ type: "board", boardId, page: 1 });
          }}
          className="text-terminal-red hover:text-terminal-highlight"
        >
          [C] 취소
        </button>
      </div>
    </div>
  );
}

// ===== Help Screen =====
function HelpScreen({ user }: { user: User | null }) {
  return (
    <div className="animate-fade-in">
      <SectionTitle>═══ 도 움 말 ═══</SectionTitle>
      <Divider />

      <div className="space-y-4 text-sm leading-relaxed">
        <div>
          <p className="text-terminal-cyan font-bold mb-1">▶ 기본 명령어</p>
          <div className="pl-3">
            <p><span className="text-terminal-highlight">M</span> — 메인 화면으로 이동</p>
            <p><span className="text-terminal-highlight">B</span> — 이전 화면으로 돌아가기</p>
            <p><span className="text-terminal-highlight">H</span> — 도움말 보기</p>
          </div>
        </div>

        <div>
          <p className="text-terminal-cyan font-bold mb-1">▶ 게시판 명령어</p>
          <div className="pl-3">
            <p><span className="text-terminal-highlight">번호</span> — 해당 항목 선택</p>
            <p><span className="text-terminal-highlight">N</span> — 다음 페이지</p>
            <p><span className="text-terminal-highlight">P</span> — 이전 페이지</p>
            <p><span className="text-terminal-highlight">W</span> — 글쓰기</p>
            <p><span className="text-terminal-highlight">L</span> — 목록으로 돌아가기</p>
          </div>
        </div>

        <div>
          <p className="text-terminal-cyan font-bold mb-1">▶ 계정 명령어</p>
          <div className="pl-3">
            <p><span className="text-terminal-highlight">login</span> — 로그인</p>
            <p><span className="text-terminal-highlight">signup</span> — 회원가입</p>
            <p><span className="text-terminal-highlight">logout</span> — 로그아웃</p>
          </div>
        </div>

        <div>
          <p className="text-terminal-cyan font-bold mb-1">▶ 사용 팁</p>
          <div className="pl-3">
            <p>• 모든 메뉴는 클릭으로도 이동할 수 있습니다.</p>
            <p>• 명령어는 한글/영문 모두 사용 가능합니다.</p>
            <p>• 예: &apos;메인&apos; = &apos;M&apos;, &apos;뒤로&apos; = &apos;B&apos;</p>
          </div>
        </div>

        {user?.isAdmin && (
          <div>
            <p className="text-terminal-red font-bold mb-1">▶ 관리자 기능</p>
            <div className="pl-3">
              <p>• 게시글 목록에서 <span className="text-terminal-red">[X]</span> 클릭 → 글 삭제</p>
              <p>• 글 읽기에서 <span className="text-terminal-red">[D] 글삭제</span> 클릭 → 글 삭제</p>
              <p>• 댓글 옆 <span className="text-terminal-red">[삭제]</span> 클릭 → 댓글 삭제</p>
            </div>
          </div>
        )}
      </div>

      <Divider />
      <p className="text-terminal-gray text-sm">뒤로가려면 B를 입력하세요.</p>
    </div>
  );
}

// ===== About Screen =====
function AboutScreen() {
  return (
    <div className="animate-fade-in">
      <SectionTitle>═══ 하이컴 안내 ═══</SectionTitle>
      <Divider />

      <div className="space-y-3 leading-relaxed">
        <p className="text-terminal-highlight font-bold">
          하이컴 (HiComm) — (주)하이시어 정보통신 서비스
        </p>
        <p>
          하이컴은 (주)하이시어에서 운영하는
          온라인 정보통신 서비스입니다.
        </p>
        <p>
          전국의 회원 여러분과 다양한 정보와 이야기를
          나눌 수 있는 열린 공간을 제공합니다.
        </p>

        <div className="mt-4">
          <p className="text-terminal-cyan font-bold">▶ 서비스 안내</p>
          <div className="pl-3 mt-1">
            <p>• 자유게시판</p>
            <p>• 명령어 입력 및 메뉴 선택 인터페이스</p>
            <p>• 24시간 접속 가능</p>
            <p>• PC / 모바일 접속 지원</p>
          </div>
        </div>

        <div className="mt-4">
          <p className="text-terminal-cyan font-bold">▶ 운영 정보</p>
          <div className="pl-3 mt-1">
            <p>• 서비스명: 하이컴 (HiComm)</p>
            <p>• 운영사: (주)하이시어 (Highseer Inc.)</p>
            <p>• 버전: v2.0</p>
          </div>
        </div>
      </div>

      <Divider />
      <p className="text-terminal-gray text-sm">뒤로가려면 B를 입력하세요.</p>
    </div>
  );
}

// ===== Terms Screen =====
function TermsScreen({ onBack }: { onBack: () => void }) {
  return (
    <div className="animate-fade-in flex flex-col h-full">
      <SectionTitle>═══ 이용약관 ═══</SectionTitle>
      <Divider />

      <div className="flex-1 overflow-y-auto pr-2 text-sm leading-relaxed space-y-4 text-terminal-text">
        <p>
          본 서비스(Highseer HiComm)를 이용해 주셔서 감사합니다.
          회원 가입 및 서비스 이용 시 다음 약관에 동의하는 것으로 간주됩니다.
        </p>

        <div className="border border-terminal-darkgray bg-terminal-bg-dark p-3">
          <h3 className="text-terminal-highlight font-bold mb-2">[데이터 활용 안내]</h3>
          <p className="mb-2">
            1. 본 커뮤니티에 작성된 게시글 및 댓글 데이터는 (주)하이시어의
            <span className="text-terminal-cyan font-bold"> &apos;모의 주식 시뮬레이터&apos; </span>
            프로젝트의 시장 반응 분석 및 감성 분석 데이터로 활용될 수 있습니다.
          </p>
          <p>
            2. 활용되는 데이터에서 사용자의 개인 식별 정보(비밀번호, 이메일, 아이디 등)는
            <span className="text-terminal-red"> 철저히 배제</span>되며, 오직 공개된 데이터(닉네임, 작성 내용, 날짜, 조회수)만이
            분석 목적으로 사용됩니다.
          </p>
          <p className="mt-2">
            3. 사용자는 언제든지 탈퇴를 요청할 수 있으며, 탈퇴 시 개인정보는 즉시 파기됩니다.
            단, 이미 작성된 게시글과 댓글은 보존될 수 있습니다.
          </p>
        </div>

        <div>
          <h3 className="text-terminal-cyan font-bold mb-1">▶ 게시물 저작권</h3>
          <p>회원이 작성한 게시물의 저작권은 회원 본인에게 있으며, 회사는 서비스 내 게재권 및 홍보, 분석 목적의 활용권을 갖습니다.</p>
        </div>

        <div>
          <h3 className="text-terminal-cyan font-bold mb-1">▶ 준수 사항</h3>
          <p>타인의 권리를 침해하거나 법령에 위반되는 게시물을 작성해서는 안 되며, 이에 대한 법적 책임은 작성자에게 있습니다.</p>
        </div>

        <p className="text-terminal-gray text-xs">
          본 약관은 2026년 2월 13일부터 시행됩니다.
        </p>
      </div>

      <Divider />
      <div className="mt-2">
        <button
          onClick={onBack}
          className="text-terminal-cyan hover:text-terminal-highlight"
        >
          [B] 뒤로가기 (또는 ESC)
        </button>
      </div>
    </div>
  );
}

// ===== My Info Screen =====
function MyInfoScreen({
  user,
  onLogout,
  onWithdraw,
  onBack,
}: {
  user: User;
  onLogout: () => void;
  onWithdraw: () => void;
  onBack: () => void;
}) {
  return (
    <div className="animate-fade-in">
      <SectionTitle>═══ 내 정 보 ═══</SectionTitle>
      <Divider />

      <div className="my-6 space-y-4">
        <div>
          <label className="text-terminal-cyan text-sm block mb-1">닉네임</label>
          <div className="text-terminal-highlight text-lg font-bold">
            {user.nickname}
          </div>
        </div>
        <div>
          <label className="text-terminal-cyan text-sm block mb-1">아이디</label>
          <div className="text-terminal-text">
            {user.username}
          </div>
        </div>
        <div>
          <label className="text-terminal-cyan text-sm block mb-1">권한</label>
          <div className="text-terminal-text">
            {user.isAdmin ? <span className="text-terminal-red">관리자</span> : "일반 회원"}
          </div>
        </div>
      </div>

      <Divider />

      <div className="flex flex-col gap-3 text-sm">
        <button
          onClick={onLogout}
          className="text-terminal-yellow hover:text-terminal-highlight text-left"
        >
          [로그아웃]
        </button>
        <button
          onClick={onWithdraw}
          className="text-terminal-red hover:text-terminal-highlight text-left"
        >
          [회원탈퇴]
        </button>
      </div>

      <Divider />
      <div className="mt-2">
        <button
          onClick={onBack}
          className="text-terminal-cyan hover:text-terminal-highlight"
        >
          [B] 뒤로가기
        </button>
      </div>
    </div>
  );
}
