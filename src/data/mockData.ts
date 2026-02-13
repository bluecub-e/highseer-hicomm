export interface Post {
    id: number;
    boardId: string;
    title: string;
    author: string;
    date: string;
    views: number;
    content: string;
}

export interface Board {
    id: string;
    name: string;
    description: string;
}

export interface Comment {
    id: number;
    postId: number;
    author: string;
    content: string;
    date: string;
}

export const boards: Board[] = [
    { id: "free", name: "자유게시판", description: "하이컴의 모든 이야기를 나누는 열린 공간" },
];

export const initialComments: Comment[] = [
    { id: 1, postId: 1, author: "환영봇", content: "가입을 환영합니다! 즐거운 시간 보내세요~ ^^", date: "2026-02-10" },
    { id: 2, postId: 1, author: "고참회원", content: "반갑습니다! 여기 분위기 좋으니 자주 놀러오세요~", date: "2026-02-10" },
    { id: 3, postId: 2, author: "초보회원", content: "저도 오늘 날씨 좋아서 기분 좋네요!", date: "2026-02-10" },
    { id: 4, postId: 4, author: "하늘바라기", content: "하이텔 쓰던 시절이 진짜 그립습니다...", date: "2026-02-09" },
    { id: 5, postId: 4, author: "옛날사람", content: "삐~~~~뚜두두두 모뎀소리 ㅋㅋ 공감", date: "2026-02-09" },
    { id: 6, postId: 4, author: "초보회원", content: "저는 나우누리 세대입니다 ^^", date: "2026-02-10" },
    { id: 7, postId: 6, author: "웃음대장", content: "버그 ㅋㅋㅋㅋ 진짜 웃기네요", date: "2026-02-10" },
    { id: 8, postId: 6, author: "추억의시스템", content: "큐(Queue) 줄이 길어서 ㅋㅋ 이건 처음 들어봅니다", date: "2026-02-10" },
    { id: 9, postId: 8, author: "리눅스사랑", content: "AI 활용 팁 공유 부탁드립니다!", date: "2026-02-10" },
    { id: 10, postId: 8, author: "별빛소년", content: "코딩할 때 AI 도움 많이 받고 있어요~", date: "2026-02-10" },
    { id: 11, postId: 10, author: "음악사랑", content: "발더스 게이트 3 저도 재밌게 했어요!", date: "2026-02-10" },
    { id: 12, postId: 11, author: "멜로디", content: "서태지 난 알아요는 진짜 명곡이죠!", date: "2026-02-10" },
    { id: 13, postId: 11, author: "개그맨", content: "패닉 - 달팽이 추가 감사합니다!", date: "2026-02-10" },
    { id: 14, postId: 9, author: "테크마니아", content: "vi 에디터 처음에 진짜 어렵죠 ㅋㅋ", date: "2026-02-09" },
    { id: 15, postId: 3, author: "게임러", content: "저도 영화 볼까 하는데 듄 2 추천합니다!", date: "2026-02-09" },
];

export const posts: Post[] = [
    // 자유게시판
    {
        id: 1, boardId: "free",
        title: "[가입인사] 안녕하세요! 하이컴에 처음 왔습니다 ^^",
        author: "초보회원", date: "2026-02-10", views: 42,
        content: `안녕하세요, 여러분!

오늘 처음으로 하이시어 하이컴에 가입했습니다.
앞으로 잘 부탁드립니다~ ^^

여기 분위기가 정말 옛날 PC통신 느낌이라
너무 좋네요. 추억이 새록새록...

- 초보회원 올림 -`
    },
    {
        id: 2, boardId: "free",
        title: "[잡담] 오늘 날씨가 정말 좋네요",
        author: "하늘바라기", date: "2026-02-10", views: 28,
        content: `오늘 서울 날씨 정말 화창하네요!
봄이 오는 것 같아서 기분이 좋습니다.

다들 오늘 하루도 화이팅하세요! :)`
    },
    {
        id: 3, boardId: "free",
        title: "[질문] 주말에 뭐 하세요?",
        author: "주말좋아", date: "2026-02-09", views: 35,
        content: `이번 주말에 뭐 하실 예정이신가요?
저는 집에서 영화나 볼까 합니다.
추천할 만한 영화 있으면 알려주세요~`
    },
    {
        id: 4, boardId: "free",
        title: "[회고] 옛날 PC통신 시절이 그립습니다",
        author: "추억의시스템", date: "2026-02-09", views: 67,
        content: `하이텔, 천리안, 나우누리...
그때 그 시절이 정말 그립네요.

모뎀 소리 '삐~~~~뚜두두두두~'
지금 들으면 얼마나 반가울까.

그때 만들었던 동호회 친구들
지금은 어디서 뭘 하고 있을까요?

이렇게 PC통신 감성의 사이트를 만나니
정말 감회가 새롭습니다. ^^`
    },
    {
        id: 5, boardId: "free",
        title: "[가입인사] 자기소개 합니다!",
        author: "별빛소년", date: "2026-02-08", views: 19,
        content: `안녕하세요! 별빛소년입니다.
나이는 비밀이고요~ ㅎㅎ
관심사는 프로그래밍, 음악, 게임입니다.
반갑습니다!`
    },
    // 유머게시판 -> 통합
    {
        id: 6, boardId: "free",
        title: "[유머] 컴퓨터 관련 아재개그 모음 ㅋㅋ",
        author: "개그맨", date: "2026-02-10", views: 89,
        content: `Q: 프로그래머가 가장 싫어하는 곤충은?
A: 버그(Bug) ㅋㅋㅋ

Q: 컴퓨터가 추울 때 하는 말은?
A: 윈도우 닫아줘~ ㅋㅋ

Q: 가장 인기 많은 자료구조는?
A: 큐(Queue)! 줄이 길어서~ ㅎㅎ

오글오글하지만 웃기죠? ㅋㅋ`
    },
    {
        id: 7, boardId: "free",
        title: "[유머] 오늘의 유머: 개발자 출근",
        author: "웃음대장", date: "2026-02-09", views: 55,
        content: `신입 개발자의 하루:

09:00 - 출근! 오늘도 열심히!
09:30 - 커피 한 잔 마시며 코딩 시작
10:00 - 에러 발생... 뭐지?
12:00 - 점심시간! 잠시 휴식
13:00 - 에러 원인 분석 중...
17:00 - 아! 세미콜론 하나 빠졌구나!
18:00 - 퇴근!

세미콜론 하나에 하루를 바치다 ㅋㅋㅋ`
    },
    // 컴퓨터/기술 -> 통합
    {
        id: 8, boardId: "free",
        title: "[정보통신] 요즘 AI 기술 발전이 대단하네요",
        author: "테크마니아", date: "2026-02-10", views: 73,
        content: `최근 AI 기술의 발전 속도가 정말 놀랍습니다.

특히 대규모 언어 모델(LLM)의 발전이
정말 눈부시네요.

여러분은 AI를 어떻게 활용하고 계신가요?
좋은 활용 팁 있으면 공유해주세요!`
    },
    {
        id: 9, boardId: "free",
        title: "[정보통신] 리눅스 초보자 가이드",
        author: "리눅스사랑", date: "2026-02-08", views: 41,
        content: `리눅스를 처음 시작하시는 분들을 위한 팁!

1. 우분투(Ubuntu)로 시작하세요
2. 터미널 기본 명령어를 익히세요
   - ls, cd, mkdir, rm, cp, mv
3. vi/vim 에디터에 익숙해지세요
4. 패키지 관리자(apt)를 활용하세요

궁금한 점 있으면 댓글로 물어보세요!`
    },
    // 게임이야기 -> 통합
    {
        id: 10, boardId: "free",
        title: "[게임] 요즘 하는 게임 추천해주세요!",
        author: "게임러", date: "2026-02-10", views: 38,
        content: `요즘 할 게임이 없어서 지루합니다 ㅠㅠ
장르 안 가리고 재미있는 게임 추천 부탁드려요!

최근에 했던 게임:
- 발더스 게이트 3
- 엘든 링
- 스타듀 밸리

비슷한 취향이신 분들 추천 부탁!`
    },
    // 음악감상실 -> 통합
    {
        id: 11, boardId: "free",
        title: "[음악] 90년대 가요 명곡 리스트",
        author: "음악사랑", date: "2026-02-10", views: 52,
        content: `90년대 가요 명곡 모음!

1. 서태지와 아이들 - 난 알아요
2. 신해철 - 그대에게
3. 김건모 - 잘못된 만남
4. 이승철 - 그런 걸까
5. 룰라 - 날개 잃은 천사
6. R.ef - 이별 공식
7. 패닉 - 달팽이
8. 자우림 - 하하하 song

추가할 곡 있으면 댓글로!`
    },
    {
        id: 12, boardId: "free",
        title: "[음악] 오늘의 추천곡: 잔나비",
        author: "멜로디", date: "2026-02-09", views: 31,
        content: `오늘의 추천곡은
잔나비의 '주저하는 연인들을 위해'입니다.

듣고 있으면 마음이 따뜻해지는 곡이에요.
아직 안 들어보셨다면 꼭 한번 들어보세요!

특히 가사가 정말 좋습니다. ♪`
    },
];
