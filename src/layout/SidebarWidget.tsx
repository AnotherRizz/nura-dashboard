export default function SidebarWidget() {
  return (
    <div
      className={`
        mx-auto mb-10 w-full max-w-60 rounded-2xl bg-gray-100 px-2 py-2 text-center dark:bg-white/[0.01]`}
    >
      <p className=" text-gray-700 text-theme-xs dark:text-gray-200">
        Powered by
      </p>
      <img src="./images/linea.svg" className=" mx-auto" alt="p" />
      {/* <p className="mb-4 text-gray-500 text-theme-xs dark:text-gray-400">
        PT Linea Global Teknologi
      </p> */}
      {/* <a
        href="https://tailadmin.com/pricing"
        target="_blank"
        rel="nofollow"
        className="flex items-center justify-center p-3 font-medium text-white rounded-lg bg-brand-500 text-theme-sm hover:bg-brand-600"
      >
        Purchase Plan
      </a> */}
    </div>
  );
}
