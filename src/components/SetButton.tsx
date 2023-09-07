interface ButtonProps {
    buttonValue: string
}

export default function SetButton({buttonValue}:ButtonProps) {


    return (
        <button className="bg-[#2cbe6b] text-white font-bold rounded-lg px-3 py-2  disabled:opacity-50">{buttonValue}</button>
    )
}