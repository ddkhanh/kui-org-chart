import React, { useEffect, useLayoutEffect, useRef, useState } from "react";
import { ChevronDownIcon, ChevronUpIcon, XIcon } from '@heroicons/react/solid'
import { animated, useSpring, useSpringRef } from '@react-spring/web'
export const ChartDetailed = (props) => {
    const show = props.show;
    const node = props.node || {}
    const toggleModal = () => {
        props.toggleModal()
    }
    return (
        <>
            {show ? (
                <>
                    <div
                        className="justify-center flex overflow-x-hidden overflow-y-auto fixed inset-0 z-50 outline-none focus:outline-none"
                    >
                        <div className="relative w-auto my-6 mx-auto max-w-6xl">
                            {/*content*/}
                            <div className="border-0 rounded-lg shadow-lg relative flex flex-col w-full bg-white outline-none focus:outline-none">
                                <div className="absolute right-1 m-2 pr-1 pt-1">
                                    <button className="bg-transparent" onClick={() => toggleModal(false)}>
                                        <XIcon className="text-slate-300 hover:text-red-600 w-5 h-5 justify-end"></XIcon>
                                    </button>
                                </div>
                                <div className="grid grid-cols-8 gap-4 p-3">
                                    <div className="flex flex-col col-span-2 bg-gray-100">
                                        <div className="w-full max-h-48 pt-2 overflow-y-auto">
                                            <img src={node.data.imageUrl}></img>
                                        </div>
                                        <h3 className="text-3xl font-semibold pt-20 pl-10">
                                            {node.data.name}
                                        </h3>
                                        <div className="pt-5 pl-10 pr-10">
                                            <h3 className="text-2xl font-semibold pt-5 pb-2 border-b border-black">
                                                Contact
                                            </h3>

                                            <div className="grid grid-cols-1 pt5 pb-2">
                                                <span className="text-lg font-semibold pr-1">Address:</span>
                                                <span className="text-md">{node.data.office}</span>
                                                <span className="text-lg font-semibold pr-1 pt-2">Phone:</span>
                                                <span className="text-md">{node.data.positionName}</span>
                                                <span className="text-lg font-semibold pr-1 pt-2">Email:</span>
                                                <span className="text-md">example@gmail.com</span>
                                            </div>
                                        </div>
                                        <div className="pt-5 pl-10 pr-8">
                                            <h3 className="text-2xl font-semibold pt-5 pb-2 border-b border-black">
                                                Languages
                                            </h3>

                                            <div className="grid grid-cols-1 pt5 pb-2">
                                                <span className="text-lg font-semibold pr-1">Address:</span>
                                                <span className="text-md">{node.data.office}</span>
                                                <span className="text-lg font-semibold pr-1 pt-2">Phone:</span>
                                                <span className="text-md">{node.data.positionName}</span>
                                                <span className="text-lg font-semibold pr-1 pt-2">Email:</span>
                                                <span className="text-md">example@gmail.com</span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex flex-col col-span-6">
                                        <PersonalDetails />
                                        <Contracts />
                                        <Education />
                                        <PAForeignLanguage />
                                        <Salary></Salary>
                                        <Probation></Probation>
                                    </div>
                                </div>

                            </div>
                        </div>
                    </div>
                    <div className="opacity-25 fixed inset-0 z-40 bg-black"></div>
                </>
            ) : null}
        </>
    );
}

const Section = (props) => {
    const title = props.title;
    const [expanded, setExpanded] = useState(true);
    const [styles, animate] = useSpring(() => ({}), []);
    const ref = useRef(null);
    useEffect(() => {
        animate({
            opacity: expanded ? 1 : 0,
            height: (expanded ? ref.current.offsetHeight : 0) + "px",
        });
    }, [animate, ref, expanded]);

    return (
        <div className={`mt-6 p-3 mb-4 rounded-lg bg-slate-50 ${expanded? 'drop-shadow-md' : ''}`}>
            <div>
                <a href="#" onClick={() => {
                    setExpanded(!expanded)
                }}>
                    <h3 className={`text-2xl font-semibold ${expanded? "pb-1 border-b border-black text-blue-600" : ""} hover:text-blue-800`}>
                        {title}
                    </h3>
                </a>
            </div>
            <animated.div style={styles}>
                {expanded ?
                    <div ref={ref} className="bg-white p-2 rounded-lg mt-3">
                        {props.children}
                    </div>
                    : <div></div>
                }
            </animated.div>
        </div>
    )
}

const PersonalDetails = (props) => {
    return (
        <Section title="Personal Details">
            <div className="grid grid-cols-4 gap-3 pt-2">
                <p className="font-medium">Gender:</p>
                <p>Male</p>
                <p className="font-medium">Mobile phone:</p>
                <p>09xxxxxxxx</p>
                <p className="font-medium">Public Contact:</p>
                <p>09xxxxxxxx</p>
                <p className="font-medium">Emergency:</p>
                <p>09xxxxxxxx</p>
                <p className="font-medium">Home phone:</p>
                <p>09xxxxxxxx</p>
                <p className="font-medium col-start-1">Contact address:</p>
                <p className="col-span-3">ABC-123 Nguyễn Thần Hiến, P.18, Q.4, TP.HCM</p>
                <p className="font-medium col-start-1">Permanent address:</p>
                <p className="col-span-3">ABC-123 Nguyễn Thần Hiến, P.18, Q.4, TP.HCM</p>
                <p className="font-medium">Marital status:</p>
                <p>09xxxxxxxx</p>
                <p className="font-medium">Birthdate:</p>
                <p>09xxxxxxxx</p>
                <p className="font-medium">Birthplace:</p>
                <p>09xxxxxxxx</p>
                <p className="font-medium col-start-1">Nationality:</p>
                <p>09xxxxxxxx</p>
                <p className="font-medium col-start-1">ID card:</p>
                <p>09xxxxxxxx</p>
                <p className="font-medium">Issued date:</p>
                <p>09xxxxxxxx</p>
                <p className="font-medium">Issued place:</p>
                <p>09xxxxxxxx</p>
                <p className="font-medium col-start-1">Passport:</p>
                <p>09xxxxxxxx</p>
                <p className="font-medium">Issued date:</p>
                <p>09xxxxxxxx</p>
                <p className="font-medium">Expiry date:</p>
                <p>09xxxxxxxx</p>
                <p className="font-medium">Social insurance book:</p>
                <p>09xxxxxxxx</p>
                <p className="font-medium">Other insurance:</p>
                <p>09xxxxxxxx</p>
                <p className="font-medium col-start-1">Experience before TMA:</p>
                <p>09xxxxxxxx</p>
                <p className="font-medium">Experience in TMA:</p>
                <p>09xxxxxxxx</p>
                <p className="font-medium">Total Experience:</p>
                <p>09xxxxxxxx</p>
                <p className="font-medium col-start-1">Degree:</p>
                <p>09xxxxxxxx</p>
            </div>
        </Section>
    )
}

const Contracts = (props) => {
    return (
        <Section title="Contracts">
            <div className="grid grid-cols-4 gap-3 pt-2">
                <p className="font-medium">Gender:</p>
                <p>Male</p>
                <p className="font-medium">Mobile phone:</p>
                <p>09xxxxxxxx</p>
                <p className="font-medium">Public Contact:</p>
                <p>09xxxxxxxx</p>
                <p className="font-medium">Emergency:</p>
                <p>09xxxxxxxx</p>
                <p className="font-medium">Home phone:</p>
                <p>09xxxxxxxx</p>
                <p className="font-medium col-start-1">Contact address:</p>
                <p className="col-span-3">ABC-123 Nguyễn Thần Hiến, P.18, Q.4, TP.HCM</p>
            </div>
        </Section>
    )
}
const Education = (props) => {
    return (
        <Section title="Education">
            <div className="pt-2">
                <table className="table-auto">
                    <thead>
                        <tr>
                            <th className="p-1 w-1/2 text-left font-medium">University</th>
                            <th className="p-1 w-1/2 text-left font-medium">From</th>
                            <th className="p-1 w-1/2 text-left font-medium">To</th>
                            <th className="p-1 w-1/2 text-left font-medium">Degree/Diploma/Certificate</th>
                            <th className="p-1 w-1/2 text-left font-medium">Major</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td className="p-3">The Sliding Mr. Bones (Next Stop, Pottersville)</td>
                            <td className="p-3">Malcolm Lockyer</td>
                            <td className="p-3">1961</td>
                            <td className="p-3">1961</td>
                            <td className="p-3">1961</td>
                        </tr>
                        <tr>
                            <td className="p-3">Witchy Woman</td>
                            <td className="p-3">The Eagles</td>
                            <td className="p-3">1972</td>
                            <td className="p-3">1961</td>
                            <td className="p-3">1961</td>
                        </tr>
                        <tr>
                            <td className="p-3">Shining Star</td>
                            <td className="p-3">Earth, Wind, and Fire</td>
                            <td className="p-3">1975</td>
                            <td className="p-3">1961</td>
                            <td className="p-3">1961</td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </Section>
    )
}

const PAForeignLanguage = (props) => {
    return (
        <Section title="PA Foreign Language">
            <div className="grid grid-cols-4 gap-3 pt-2">
                <p className="font-medium">Gender:</p>
                <p>Male</p>
                <p className="font-medium">Mobile phone:</p>
                <p>09xxxxxxxx</p>
                <p className="font-medium">Public Contact:</p>
                <p>09xxxxxxxx</p>
                <p className="font-medium">Emergency:</p>
                <p>09xxxxxxxx</p>
                <p className="font-medium">Home phone:</p>
                <p>09xxxxxxxx</p>
                <p className="font-medium col-start-1">Contact address:</p>
                <p className="col-span-3">B92 Nguyễn Thần Hiến, P.18, Q.4, TP.HCM</p>
            </div>
        </Section>
    )
}

const Salary = (props) => {
    return (
        <Section title="Salary">
            <div className="grid grid-cols-4 gap-3 pt-2">
                <p className="font-medium">Gender:</p>
                <p>Male</p>
                <p className="font-medium">Mobile phone:</p>
                <p>09xxxxxxxx</p>
                <p className="font-medium">Public Contact:</p>
                <p>09xxxxxxxx</p>
                <p className="font-medium">Emergency:</p>
                <p>09xxxxxxxx</p>
                <p className="font-medium">Home phone:</p>
                <p>09xxxxxxxx</p>
                <p className="font-medium col-start-1">Contact address:</p>
                <p className="col-span-3">B92 Nguyễn Thần Hiến, P.18, Q.4, TP.HCM</p>
            </div>
        </Section>
    )
}

const Probation = (props) => {
    return (
        <Section title="Probation">
            <div className="grid grid-cols-4 gap-3 pt-2">
                <p className="font-medium">Gender:</p>
                <p>Male</p>
                <p className="font-medium">Mobile phone:</p>
                <p>09xxxxxxxx</p>
                <p className="font-medium">Public Contact:</p>
                <p>09xxxxxxxx</p>
                <p className="font-medium">Emergency:</p>
                <p>09xxxxxxxx</p>
                <p className="font-medium">Home phone:</p>
                <p>09xxxxxxxx</p>
                <p className="font-medium col-start-1">Contact address:</p>
                <p className="col-span-3">B92 Nguyễn Thần Hiến, P.18, Q.4, TP.HCM</p>
            </div>
        </Section>
    )
}