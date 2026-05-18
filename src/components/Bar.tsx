import githubIcon from '../assets/github.png';

const Github = 'https://github.com/museaco/Mikan';

export default function Bar() {
  return (
    <>
      <div className="flex items-center justify-between     w-full px-3 py-3 border-zinc-800 border-b-3 text-fg-primary">
        <a target="_blank" href={Github}><h1 className="m-0">Mikan</h1></a>
        <div>
          <a target="_blank" href={Github}>
            <img src={githubIcon} className="w-6 cursor-pointer" alt="" />
          </a>
        </div>
      </div>
    </>
  );

}
