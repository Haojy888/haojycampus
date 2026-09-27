// Pure story data. Positions use the existing Three.js layout: x east, z south.
// The playable character keeps its current identity. Only these three NPCs are new.
// choice.effect is an intent for the host game; selecting a reply is never a skill check.

export const STORY = {
  id: 'campus_festival_first_page',
  version: 1,
  title: '校园祭，还差你这一页',
  subtitle: '一阵风吹散了策划本，也让几位还不太熟的同学碰到了一起。',
  duration: '约 15 分钟，含散步、阅读和可选聊天；不设倒计时或强制等待。',
  opening: '校园祭开始前，学生会的策划本少了三页。校门口有人抱着一摞海报，正朝你招手。',
  chapterOrder: ['gate', 'pages', 'rhythm', 'photo', 'finale'],
};

export const INITIAL_STORY_STATE = {
  chapterId: 'gate',
  collectedItemIds: [],
  flags: {},
  rhythmBest: null,
  photoStyle: null,
  endingChoice: null,
  completed: false,
};

export const STORY_RULES = {
  persistence: 'Save after an item pickup, committed dialogue choice, rhythm round, photo, or ending. Resume the same chapter.',
  items: 'Permanent, unique records. Pickups never remove earlier pages. Revisiting a page shows its text without adding another copy.',
  order: 'Advance only along STORY.chapterOrder. Pages may be found in any order once the quest is accepted.',
  rhythm: 'Finishing all three attempts completes the rehearsal at any score. Retry is optional and keeps the best score.',
  photo: 'Opening or cancelling the camera does not complete the chapter; only confirming the photo does.',
  choices: 'Replies change immediate feedback or the final card. They do not create separate quest trees.',
  ending: 'Completing the story keeps the world, notebook, rhythm replay, and eight landmark stamps available.',
  placeholders: ['{foundPages}', '{rhythmScore}'],
};

export const NPCS = [
  {
    id: 'lin_cheng', name: '嘉豪', role: '学生会 · 活动统筹', color: '#df9868',
    detail: '抱着海报，说话利落。事情越多，越容易把自己的那份忘掉。',
    positions: {
      gate: { x: 4, z: 89 }, pages: { x: 4, z: 89 },
      rhythm: { x: -25, z: -43 }, photo: { x: -25, z: -43 },
      finale: { x: -25, z: -43 }, complete: { x: -25, z: -43 },
    },
    dialogues: {
      gate: 'lin_gate', pages: 'lin_pages', rhythm: 'lin_waiting',
      photo: 'lin_waiting', finale: 'lin_finale', complete: 'lin_complete',
    },
  },
  {
    id: 'tang_yu', name: '唐予', role: '摄影社 · 记录员', color: '#8798c6',
    detail: '相机背带上挂着一枚旧校徽。拍照片前，总会先问一句“你愿意吗”。',
    positions: {
      gate: { x: 40, z: -2 }, pages: { x: 40, z: -2 },
      rhythm: { x: 34, z: -16 }, photo: { x: 34, z: -16 },
      finale: { x: -24, z: -47 }, complete: { x: 34, z: -16 },
    },
    dialogues: {
      gate: 'tang_before', pages: 'tang_pages', rhythm: 'tang_waiting',
      photo: 'tang_photo', finale: 'tang_after_photo', complete: 'tang_complete',
    },
  },
  {
    id: 'zhou_yu', name: '周屿', role: '篮球社 · 体验摊位负责人', color: '#73a582',
    detail: '投篮前会数三拍。看着很有把握，其实今天第一次负责活动。',
    positions: {
      gate: { x: 74, z: 35 }, pages: { x: 74, z: 35 },
      rhythm: { x: 74, z: 35 }, photo: { x: 74, z: 35 },
      finale: { x: -23, z: -40 }, complete: { x: 74, z: 35 },
    },
    dialogues: {
      gate: 'zhou_before', pages: 'zhou_before', rhythm: 'zhou_rhythm',
      photo: 'zhou_after', finale: 'zhou_finale', complete: 'zhou_complete',
    },
  },
];

export const ITEMS = [
  {
    id: 'page_welcome', name: '策划页一 · 谁都能来', chapterId: 'pages',
    landmarkId: 'academic', position: { x: -14, z: 36 },
    clue: '西侧教学楼前，靠中轴步道的公告栏边。',
    inspect: '纸页压在公告栏底座旁，右上角画着一扇没有门槛的门。',
    text: '校园祭不只留给社团里的熟面孔。新来的同学、一个人逛的人、不想上台的人，都要有一个舒服的位置。\n——嘉豪的备注：别把“欢迎参加”只写在海报上。',
    pickupText: '收好了《谁都能来》。策划页会一直保存在手账里。',
  },
  {
    id: 'page_try', name: '策划页二 · 先试一下', chapterId: 'pages',
    landmarkId: 'academic', position: { x: 13, z: 48.5 },
    clue: '中轴东侧教学楼前，靠近南端的连廊拐角。',
    inspect: '这页夹在长椅脚边。上面有三个圆圈，旁边的“必须全中”被划掉了。',
    text: '篮球体验：每人三次。命中不是入场条件，愿意试一下就算参加。\n——周屿：如果第一球没进，旁边的人先别叹气。递下一球就好。',
    pickupText: '收好了《先试一下》。三个圆圈，原来是一次不怕失手的邀请。',
  },
  {
    id: 'page_memory', name: '策划页三 · 记得留位置', chapterId: 'pages',
    landmarkId: 'ink_pond', position: { x: 43, z: -1.3 },
    clue: '墨池小桥西侧的桥头，唐予附近。走陆地过去，不用下水。',
    inspect: '纸页卡在桥头石缝里，没沾到水。背面是一张很潦草的合影站位图。',
    text: '最后拍一张合影。别只拍布置完成的会场，也拍把会场一点点搭起来的人。\n——唐予：记得给拍照的人留个位置，可以用定时快门。',
    pickupText: '三页里的最后一句写着：记得给拍照的人留个位置。',
  },
];

export const CHAPTERS = [
  {
    id: 'gate', number: 1, title: '校门口的临时搭档', minutes: 2,
    objective: '去校门口和嘉豪聊聊。', progressLabel: '认识临时搭档',
    target: { type: 'npc', id: 'lin_cheng', x: 4, z: 89, label: '嘉豪 · 学校正门' },
    hint: '靠近抱着海报的同学，按 E 交谈。',
    completionEvent: 'quest_accepted', next: 'pages',
    enterText: '先看看他有什么需要帮忙的。',
    completeText: '你拿到了三个寻找地点。找回策划页，也顺路看看校园。',
  },
  {
    id: 'pages', number: 2, title: '风吹散的三页', minutes: 4,
    objective: '在教学楼前和墨池桥头找回三张策划页，再和唐予核对。',
    progressLabel: '策划页 {foundPages} / 3',
    target: { type: 'items_then_npc', ids: ['page_welcome', 'page_try', 'page_memory'], npcId: 'tang_yu' },
    hint: '公告栏边 → 教学楼连廊拐角 → 墨池西桥头。已找到的页可以随时在手账重读。',
    requiredItems: ['page_welcome', 'page_try', 'page_memory'],
    readyDialogue: 'tang_pages_ready', completionEvent: 'pages_confirmed', next: 'rhythm',
    enterText: '三张纸可以按任意顺序找，不会被风再次吹走。',
    completeText: '三页都在。体育场还有一场等人试玩的小活动。',
  },
  {
    id: 'rhythm', number: 3, title: '投不进，也算参加', minutes: 3,
    objective: '到复兴体育场西入口找周屿，完成一轮三次节奏投篮。',
    progressLabel: '体验摊位 · 完成三次尝试',
    target: { type: 'npc', id: 'zhou_yu', x: 74, z: 35, label: '周屿 · 复兴体育场西入口' },
    hint: '光标进入高亮区时点击投篮。三次试完就完成任务，不要求全部命中。',
    completionEvent: 'rhythm_completed', next: 'photo',
    enterText: '周屿需要一位真正的试玩者，帮他看看规则会不会让人紧张。',
    completeText: '试玩反馈记好了。唐予在墨池北侧樱花树旁等你拍开场照片。',
  },
  {
    id: 'photo', number: 4, title: '照片里也要有你', minutes: 3,
    objective: '去樱花树旁找唐予，选一句照片配文并确认拍照。',
    progressLabel: '樱花照片 · 选配文并拍下',
    target: { type: 'npc', id: 'tang_yu', x: 34, z: -16, label: '唐予 · 樱花拍照点' },
    hint: '拍照点在墨池北侧现有樱树之间。进入取景后，按“拍下这一刻”确认；取消可以重来。',
    completionEvent: 'photo_confirmed', next: 'finale',
    enterText: '这张照片会成为校园祭的开场页。配文由你来选。',
    completeText: '照片收进手账了。现在去西北侧长廊餐厅筹备点，把今天最后一个决定交给大家。',
  },
  {
    id: 'finale', number: 5, title: '把开场留给大家', minutes: 3,
    objective: '到西北侧长廊餐厅（第一食堂）筹备点和嘉豪碰面，决定开场方式，留下一张合影。',
    progressLabel: '筹备点收尾 · 决定开场方式',
    target: { type: 'npc', id: 'lin_cheng', x: -25, z: -43, label: '嘉豪 · 长廊餐厅筹备点' },
    hint: '长廊餐厅在校园西北侧，也就是俯视图左上方。三个选择都会完成故事，只会改变开场的小安排和纪念卡文案。',
    completionEvent: 'story_completed', next: null,
    enterText: '策划页、试玩记录、开场照片都齐了。你们终于能站在同一张照片里。',
    completeText: '校园祭正式开始。故事结束后，校园仍然可以自由漫游。',
  },
];

export const RHYTHM_GAME = {
  id: 'three_shots', title: '先试一下 · 三次节奏投篮', attempts: 3,
  instructions: '光标进入高亮区时，点击“投篮”。一轮三次，试完就完成试玩。',
  inputLabel: '投篮', retryLabel: '再试一轮', continueLabel: '记下反馈，去拍照',
  feedbackByScore: [
    { score: 0, title: '我们找到要改的地方了', text: '周屿把高亮区画宽了一点：“谢谢，你让我知道第一次来的同学会在哪里犹豫。试玩完成。”' },
    { score: 1, title: '第一声欢呼', text: '第二次出手前，周屿先把球递了回来。那一球进没进，都有人认真看着。试玩完成。' },
    { score: 2, title: '找到自己的节奏', text: '“这个节奏不错，来得及看清，也来得及决定。”周屿在策划页上打了个勾。试玩完成。' },
    { score: 3, title: '好球，下一位也别紧张', text: '三次都赶上了节拍。周屿刚想写“挑战全中”，又笑着把笔收了回去：“还是写，欢迎来试。”' },
  ],
  postRoundDialogue: 'zhou_result',
};

export const PHOTO_STYLES = [
  { id: 'people', label: '拍准备活动的人', caption: '校园祭还没开始，我们已经碰到了一起。', response: '唐予点点头：“那就留一点没摆整齐的海报，真实一点挺好。”' },
  { id: 'spring', label: '拍樱花下的校园', caption: '今天的风吹散了三页纸，也替我们指了路。', response: '“这句我喜欢。”唐予退后半步，把枝头的一小片花留在画面里。' },
  { id: 'invitation', label: '给还没来的人留句话', caption: '一个人来也没关系，我们在这里等你。', response: '唐予看了看取景框：“那就留一块空地方，像真的给人留了位置。”' },
];

export const PHOTO_SPOTS = {
  cherry: { name: '樱花拍照点', x: 34, z: -13, relatedLandmarkId: 'ink_pond', confirmLabel: '拍下这一刻', cancelLabel: '再看看角度' },
  finale: { name: '校园中轴合影', x: -2, z: 68, confirmLabel: '留下合影', caption: '策划本补齐了，这次，照片里也一个人都没少。' },
};

export const ENDINGS = {
  together: {
    title: '一起说“开始吧”',
    opening: '你提议把话筒放在中间。嘉豪、周屿、唐予和你各说一句，四句不太整齐的欢迎词，换来门口第一阵笑声。',
    photoCaption: '不是谁一个人的开场，是我们一起开始的。',
    evaluation: '活动搭档 · 你让每个人都分到了一点紧张，也分到了一点勇气。',
    finalLines: ['嘉豪：下次我还找你搭档。', '周屿：我负责递球，你们负责来玩。', '唐予：定时快门开了，拍照的人这次也在。'],
  },
  newcomer: {
    title: '给新面孔一个位置',
    opening: '你建议把第一张体验券送给刚到门口、还在张望的同学。嘉豪迎了上去，周屿把球递过去。开场没有很响，却一下子热闹起来。',
    photoCaption: '欢迎参加，不只写在海报上。',
    evaluation: '温柔的引路人 · 你记得策划页上的那句话，也真的给后来的人留了位置。',
    finalLines: ['嘉豪：这比我写的开场词好。', '周屿：第一球没进也没关系，第二球在这儿。', '唐予：镜头再往旁边一点，新来的同学也能站下。'],
  },
  photograph: {
    title: '先留下这一刻',
    opening: '你提议先拍合影，再慢慢开场。唐予设置好定时快门，跑到大家身边。嘉豪还抱着海报，周屿忘了放下球，你笑着说这样就很好。',
    photoCaption: '还没准备得十全十美，但人已经到齐了。',
    evaluation: '日常记录员 · 你留下的不是一张完美摆拍，是大家愿意一起记住的下午。',
    finalLines: ['嘉豪：这张不用重拍，就它了。', '周屿：等等，我手里还抱着球——算了，挺像我。', '唐予：终于有一张，我也在里面的照片。'],
  },
};

export const DIALOGUES = {
  lin_gate: {
    speaker: 'lin_cheng', title: '你现在有空吗？',
    lines: ['嘉豪把快滑下来的海报往上抱了抱：“能搭把手吗？刚才一阵风，校园祭策划本散了。我追着海报跑，三页纸没顾上。”', '“有人看见纸往教学楼和墨池那边去了。别的准备我来做，你能帮我沿路看看吗？不是考试，慢慢找就好。”'],
    choices: [
      { id: 'help', label: '我来帮你找。', response: '太好了。公告栏、连廊拐角、墨池桥头，我把位置记进你的手账。唐予就在墨池边，找齐后和他核对一下。', effect: { event: 'quest_accepted' } },
      { id: 'route', label: '可以，先给我看下路线。', response: '先沿中轴进校园，看看两侧教学楼前，再去右手边的墨池。每找到一页就收好，不用跑回校门交给我。', effect: { event: 'quest_accepted' } },
      { id: 'new_here', label: '我不太认路，正好边走边找。', response: '那就当我拜托了一位校园观察员。手账会标位置，走错了也没事。等你回来，我请你看我们仓促但认真准备的开场。', effect: { event: 'quest_accepted' } },
    ],
  },
  lin_pages: {
    speaker: 'lin_cheng', title: '不用来回跑',
    lines: ['“已经找到 {foundPages} / 3 页了。收在你那里就好，我这里还在和胶带打架。”', '“教学楼前有两页，墨池桥头有一页。唐予拿着目录，他能帮我们确认没漏。”'],
    choices: [
      { id: 'continue', label: '我接着找，交给我。', response: '好，我把筹备点入口先布置起来。找到的内容也看看，里面有几句比正式方案还重要的话。' },
      { id: 'why', label: '这三页写的是什么？', response: '欢迎大家、体验摊位、最后的合影。其实不是多复杂的事，就是想让第一次来的同学也玩得自在。' },
      { id: 'pressure', label: '来得及吗？', response: '来得及。海报少贴两张没关系，人别急得摔一跤。我们按自己的节奏来。' },
    ],
  },
  lin_waiting: {
    speaker: 'lin_cheng', title: '筹备点这边交给我',
    lines: ['“三页策划我已经收到唐予发来的照片了，谢谢你。”', '“体育场试玩和樱花照片做完，我们就能开场。缺的不是更多装饰，是有人真的愿意来参加。”'],
    choices: [
      { id: 'work', label: '那我去把剩下的事情做完。', response: '好，手账上的当前目标会带你过去。我在入口等你。' },
      { id: 'speech', label: '你准备好开场词了吗？', response: '写了三版，都有点像广播通知。等大家回来，也许你能帮我想个自然一点的开头。' },
      { id: 'rest', label: '你也记得歇一会儿。', response: '被你发现了，我一直站着。行，我先喝口水，海报不会自己跑掉第二次吧。' },
    ],
  },
  tang_before: {
    speaker: 'tang_yu', title: '桥头那张纸',
    lines: ['“你好。你也看见那张卡在桥头的纸了吗？像是今天的策划页。”', '“嘉豪应该还在校门口收海报。你先去跟他说一声，我会看着这里，不让纸掉进水里。”'],
    choices: [
      { id: 'gate', label: '好，我去找他。', response: '沿中轴往南，校门内侧就是。他怀里那摞海报很好认。' },
      { id: 'camera', label: '你在拍什么？', response: '准备活动的样子。布置完成以后大家都拍舞台，我想留一点开始之前的片段。' },
      { id: 'bridge', label: '我先在桥边看看。', response: '可以，慢慢走。纸卡得挺牢，不用下水捡。' },
    ],
  },
  tang_pages: {
    speaker: 'tang_yu', title: '先把纸收齐',
    lines: ['“你找到 {foundPages} / 3 页了。我这里有目录：欢迎页、体验页、合影页。”', '“剩下两处在教学楼前的公告栏和连廊拐角。桥头那张也别忘了，收好后我们一起核对。”'],
    choices: [
      { id: 'find', label: '我按手账再找找。', response: '好，已经收好的不会弄丢。找到剩下的直接来找我。' },
      { id: 'note', label: '你在合影页上写了什么？', response: '记得给拍照的人留位置。每次我都说“下次再拍”，相册翻到最后，自己几乎没出现过。' },
      { id: 'promise', label: '这次你一定要站进去。', response: '那说好了。我带了小支架，定时快门也能用。等策划页找齐，我们把这条留到最后认真执行。' },
    ],
  },
  tang_pages_ready: {
    speaker: 'tang_yu', title: '三页都在，一页没少',
    lines: ['唐予按目录排好三页：“欢迎、体验、合影，齐了。我拍一份发给嘉豪，原件你继续收在手账里。”', '“体育场的周屿正缺一个试玩的人。他怕把投篮做得太难，我觉得你去试一下，比我们站这儿猜有用。”'],
    choices: [
      { id: 'go', label: '好，我去试试看。', response: '沿墨池东侧道路向南走到复兴体育场。周屿在西入口，手里抱着球。', effect: { event: 'pages_confirmed' } },
      { id: 'not_good', label: '我不太会投篮，也可以吗？', response: '当然，他最想听的就是第一次玩的人的感受。策划页上不是写了吗，先试一下就算参加。', effect: { event: 'pages_confirmed' } },
      { id: 'photo_later', label: '试玩以后，我们把照片也拍了。', response: '好，我先去墨池北侧的樱树旁找个角度。你试玩完来找我。', effect: { event: 'pages_confirmed' } },
    ],
  },
  zhou_before: {
    speaker: 'zhou_yu', title: '还在调整的小摊位',
    lines: ['“来玩投篮吗？等一下，我还没想好规则。全中才给体验章，会不会太难？”', '“这事写在策划页上，可嘉豪说那页被风吹跑了。等你们把纸找齐，我们再正式试一轮。”'],
    choices: [
      { id: 'later', label: '我处理完那边的事就来。', response: '好，我把球留在这儿。别赶路，体验摊位又不会提前打烊。' },
      { id: 'easy', label: '刚上来就要全中，确实有点紧张。', response: '你这么一说，我想起第一次来社团，光是有人盯着就不敢出手。规则得改。' },
      { id: 'job', label: '你是第一次负责这个吗？', response: '被你看出来了。平时只管自己练球，让不常打球的人也觉得好玩，还真是另一回事。' },
    ],
  },
  zhou_rhythm: {
    speaker: 'zhou_yu', title: '帮我试三次？',
    lines: ['“唐予把策划页发过来了。我自己的备注居然把我劝住了：每人三次，愿意试一下就算参加。”', '“看见移动的光标了吗？进高亮区的时候点投篮，一共三次。中几次都能完成试玩，想再来一轮也行。”'],
    choices: [
      { id: 'start', label: '来吧，我准备好了。', response: '好，先看节奏。第一球没进也别急，下一球还在。', effect: { event: 'start_rhythm' } },
      { id: 'explain', label: '我先按最简单的办法试。', response: '只盯住高亮区，光标进去就点。没有额外按键，也不用瞄准镜头。', effect: { event: 'start_rhythm' } },
      { id: 'relax', label: '说好了，失手不许叹气。', response: '说好了。我只负责把下一球递给你。', effect: { event: 'start_rhythm' } },
    ],
  },
  zhou_result: {
    speaker: 'zhou_yu', title: '试玩结束，听你的',
    lines: ['“这轮命中 {rhythmScore} / 3 次，试玩记录已经记下。谢谢你真的站过来试。”', '“我决定把摊位名字改成‘先试一下’。你想再玩可以回来，现在唐予还等着那张开场照片。”'],
    choices: [
      { id: 'continue', label: '我去找唐予，回头再玩。', response: '去吧，墨池北侧的樱树旁。等会儿筹备点见，我把球也带过去。' },
      { id: 'retry', label: '我想再找找节奏。', response: '再来一轮。任务已经完成，这次就是自己想玩，不会丢掉刚才的记录。', effect: { event: 'replay_rhythm' } },
      { id: 'feedback', label: '有人愿意等我试完，比得分更有用。', response: '这句我记下了。之后有人投不进，我就先把下一球递过去。' },
    ],
  },
  zhou_after: {
    speaker: 'zhou_yu', title: '球一直在这里',
    lines: ['“试玩已经完成，成绩也留着。你要是想练，我随时陪你再来一轮。”', '“别忘了唐予的照片。他总拍别人，今天得把他也叫到镜头前。”'],
    choices: [
      { id: 'photo', label: '我正准备去找他。', response: '好，他在墨池北侧樱树旁。别走太快，顺便看看今天的花。' },
      { id: 'replay', label: '再玩一轮。', response: '来，还是三次。已有的剧情进度不会变。', effect: { event: 'replay_rhythm' } },
      { id: 'meeting', label: '等会儿筹备点见。', response: '筹备点见。我可不想最后又只剩唐予站在相机后面。' },
    ],
  },
  tang_waiting: {
    speaker: 'tang_yu', title: '这个角度挺好',
    lines: ['“我找到拍照的地方了。你先去体育场帮周屿试完，他从刚才起就一直在给我发问号。”', '“这里我等你，花也不会在这一会儿全落光。”'],
    choices: [
      { id: 'go', label: '我先去体育场。', response: '他在复兴体育场西入口。三次投篮就能给他一个很实在的反馈。' },
      { id: 'caption', label: '照片的配文想好了吗？', response: '还没。我想等你走完这一圈，再听你觉得今天像什么。' },
      { id: 'wait', label: '辛苦你等一下。', response: '没事，我正好看看光。只要最后记得把我也叫过去就行。' },
    ],
  },
  tang_photo: {
    speaker: 'tang_yu', title: '给这张照片写句话',
    lines: ['“试玩怎么样？不用报成绩，周屿刚才发消息说，他终于知道摊位该叫什么了。”', '唐予举起相机：“开场照片想留哪种感觉？你选一句，我们就按这个想法拍。最后的合影，我也会站进去。”'],
    choices: [
      { id: 'people', label: '拍准备活动的人。', response: '好，没摆整齐的海报也留着。配文就写：校园祭还没开始，我们已经碰到了一起。', effect: { event: 'open_photo', photoStyle: 'people' } },
      { id: 'spring', label: '拍这阵风和樱花。', response: '那就让树枝进一点画面。今天的风吹散了三页纸，也替我们指了路。', effect: { event: 'open_photo', photoStyle: 'spring' } },
      { id: 'invitation', label: '给还没来的人留个位置。', response: '我在画面边上留一点空处。一个人来也没关系，我们在这里等你。', effect: { event: 'open_photo', photoStyle: 'invitation' } },
    ],
  },
  tang_after_photo: {
    speaker: 'tang_yu', title: '这一张，收好了',
    lines: ['“开场照片和配文都在手账里。照片不必每次都摆得很整齐，能让人想起当时的声音就挺好。”', '“走吧，嘉豪在筹备点等我们。定时快门我已经试过了，这次不会少一个人。”'],
    choices: [
      { id: 'go', label: '筹备点见。', response: '往校园西北侧的长廊餐厅（第一食堂）走，嘉豪在入口抱着那摞终于没被吹跑的海报。' },
      { id: 'remember', label: '我记得，你也要站进来。', response: '记得这么牢啊。那我就把相机放稳，安心跑过来。' },
      { id: 'favorite', label: '我最喜欢准备活动的这一段。', response: '我也是。正式开始以后很热闹，准备的时候，能看见每个人在乎什么。' },
    ],
  },
  lin_finale: {
    speaker: 'lin_cheng', title: '开场，听你一次',
    lines: ['“欢迎页、试玩记录、樱花照片，齐了。”嘉豪把策划本合上，又看了一眼三个人：“原来今天没少的是帮忙的人。”', '“我还是没选出哪版开场词。不过现在觉得，也不一定要按写好的来。你觉得我们怎么开始？”'],
    choices: [
      { id: 'together', label: '我们四个，一人说一句。', response: '嘉豪把话筒往中间递：“那我先说欢迎，你们接下去。说乱了也没关系。”唐予架好相机，这次大家一起站进画面。', effect: { event: 'finish_story', endingChoice: 'together' } },
      { id: 'newcomer', label: '先去邀请门口还在犹豫的同学。', response: '“欢迎参加，不能只写在海报上。”嘉豪笑了，朝门口走去。周屿抱起球，唐予给合影多留了一个位置。', effect: { event: 'finish_story', endingChoice: 'newcomer' } },
      { id: 'photograph', label: '先拍合影吧，开场不用着急。', response: '唐予按下定时快门，跑到你们身边。嘉豪还没来得及放下海报，周屿手里还抱着球。你说：“这样就很好。”', effect: { event: 'finish_story', endingChoice: 'photograph' } },
    ],
  },
  zhou_finale: {
    speaker: 'zhou_yu', title: '今天最有用的一条建议',
    lines: ['“我在摊位牌上写了‘愿意试一下就算参加’。这句话看着简单，真写出来，肩膀都轻了一点。”', '“等嘉豪说开场，我们一起进去。你要站哪儿？我给你留位置。”'],
    choices: [
      { id: 'near', label: '就站大家旁边。', response: '好，那我往边上挪一点。球抱着行吗？放地上怕它滚走。' },
      { id: 'thanks', label: '谢谢你等我试完三次。', response: '该我谢你。没人来试，我还在那儿纠结是不是必须全中。' },
      { id: 'start', label: '去听听嘉豪怎么说。', response: '走，他说最后的开场决定想听你的。' },
    ],
  },
  lin_complete: {
    speaker: 'lin_cheng', title: '今天的事，记住了',
    lines: ['“策划本我收好了，你手账里的副本也留着。下次再办活动，就知道该从哪里开始。”', '“接下来不用赶任务。想去哪里逛就去，校园祭才刚刚开始。”'],
    choices: [
      { id: 'card', label: '再看看我们的纪念卡。', response: '好，照片和最后那几句话都在。', effect: { event: 'show_ending' } },
      { id: 'stamps', label: '我继续把校园逛一圈。', response: '去吧，原来的八个地标打卡还在，没走完也没关系。今天已经够充实了。' },
      { id: 'next', label: '下次需要搭档，记得叫我。', response: '记住了。不过下次我先把策划本夹紧，再出门。' },
    ],
  },
  tang_complete: {
    speaker: 'tang_yu', title: '照片里没有少人',
    lines: ['“相册里多了一张我也在的合影。谢谢你一路记着这件事。”', '“樱花还在，想再看一会儿就看一会儿。这次不用拍照交任务。”'],
    choices: [
      { id: 'card', label: '我想再看那张纪念卡。', response: '在这里。最喜欢哪一句，就留着哪一句慢慢看。', effect: { event: 'show_ending' } },
      { id: 'sit', label: '那就在这里歇一会儿。', response: '好，听一会儿风。不是什么时候都要做点什么。' },
      { id: 'later', label: '下次也记得给自己留位置。', response: '嗯，这回不用你提醒第二遍了。' },
    ],
  },
  zhou_complete: {
    speaker: 'zhou_yu', title: '欢迎再来试一下',
    lines: ['“活动开始以后真的有人愿意来投了。最开始没进的同学，也会笑着接下一球。”', '“你呢，要不要再找找刚才那个节奏？”'],
    choices: [
      { id: 'replay', label: '来，再试一轮。', response: '还是三次，还是那句话：想试就来。故事已经完成，这轮只留最好成绩。', effect: { event: 'replay_rhythm' } },
      { id: 'watch', label: '我先在旁边看看。', response: '也欢迎。帮人捡个球，或者什么都不做，都算来玩。' },
      { id: 'leave', label: '我去别的地方逛逛。', response: '好，球一直在这里。下次路过再见。' },
    ],
  },
};

export const SIDE_QUEST = {
  id: 'campus_eight_stamps', title: '校园八景 · 随手打卡', optional: true,
  landmarkIds: ['gate', 'sculpture', 'theater', 'ink_pond', 'stadium', 'gymnasium', 'assembly_hall', 'academic'],
  description: '沿用原来的八处印章。与主线分别记录，顺路打卡即可，不影响故事结局。',
  completedText: '八处风景都走过了。你可以继续散步，也可以回纪念卡看看今天认识的人。',
};

export const JOURNAL_COPY = {
  current: '正在做的事', pages: '找回的策划页', people: '今天认识的人',
  memories: '今天的照片', optional: '顺路打卡',
  allPagesFound: '策划页 3 / 3 · 去墨池边和唐予核对',
  photoPending: '配文选好了 · 拍照后再收进手账',
  completed: '校园祭已开场 · 自由漫游',
  continueAfterEnding: '留在校园走走', replayCard: '重看纪念卡',
};

