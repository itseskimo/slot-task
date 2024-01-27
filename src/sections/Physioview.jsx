import { useState, useEffect } from 'react';
import { addPhysioCalendar ,getPhysioCalendar} from '../redux/features/doctor/doctorSlice';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
const Physioview = () => {

    const dispatch = useDispatch();
    const { bookedSlots, selectedRemarks } = useSelector((state) => state.doctor);
    const [selectedDates, setSelectedDates] = useState([]);
    const [clientId, setClientId] = useState('');
    const [token, setToken] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        if (localStorage.getItem("userInfo")) {
            const data = localStorage.getItem("userInfo");
            if (data) {
                const loginData = JSON.parse(data);
                setClientId(loginData.name);
                setToken(loginData.token);
                dispatch(getPhysioCalendar({ token: loginData.token }))
            }
        }
    }, []);




    useEffect(() => {
        setSelectedDates((bookedSlots && bookedSlots[0]?.calendars) ?? []);
    }, [bookedSlots]);

    function handleSubmit() {
        const physioData = selectedDates;
        dispatch(addPhysioCalendar({ physioData, token }));
    }

    function handleClick(day, date, selectedSlot) {
        if (currentDayIndex !== 0) {
            alert(`Slots available for Physios can only be selected on Sunday's`);
            return;
        }

        setSelectedDates((prevDates) => {
            const existingDateIndex = prevDates.findIndex((dateObj) => dateObj.date === date);

            if (existingDateIndex !== -1) {
                // Date already exists, toggle selectedSlot
                return prevDates.map((dateObj, index) => {
                    if (index === existingDateIndex) {
                        // Update the existing date
                        const existingSlots = dateObj.selectedSlots;
                        const existingSlotIndex = existingSlots.findIndex((slot) => slot.timestamp === selectedSlot.timestamp);

                        if (existingSlotIndex !== -1) {
                            // SelectedSlot already exists, remove it
                            return {
                                ...dateObj,
                                selectedSlots: [
                                    ...existingSlots.slice(0, existingSlotIndex),
                                    ...existingSlots.slice(existingSlotIndex + 1),
                                ],
                            };
                        } else {
                            // SelectedSlot doesn't exist, add it
                            return { ...dateObj, selectedSlots: [...existingSlots, selectedSlot] };
                        }
                    }
                    return dateObj;
                });
            } else {
                // Date doesn't exist, create a new object with a unique selectedSlot
                return [...prevDates, { day, date, selectedSlots: [selectedSlot] }];
            }
        });
    }



    const generateTimeSlots = () => {
        const startTime = new Date('2024-01-01T09:00:00');
        const endTime = new Date('2024-01-01T20:00:00');
        const timeSlots = [];

        let currentTime = new Date(startTime);

        while (currentTime <= endTime) {
            let period = 'morning';

            const hour = currentTime.getHours();
            if (hour >= 12 && hour < 17) {
                period = 'afternoon';
            } else if (hour >= 17) {
                period = 'evening';
            }

            timeSlots.push({
                timestamp: currentTime.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
                assignedDoctor: '',
                remark: '',
                period: period,
            });

            currentTime.setMinutes(currentTime.getMinutes() + 45);
        }

        return timeSlots;
    };



    const currentDayIndex = new Date().getDay();

    const getFormattedDate = (offset) => {
        const today = new Date();
        const targetDate = new Date(today);
        targetDate.setDate(today.getDate() + offset);

        const month = new Intl.DateTimeFormat('en-US', { month: 'short' }).format(targetDate);
        const date = targetDate.getDate();

        return `${month} ${date}`;
    };

    let calendarController = [
        { day: 'Saturday', date: getFormattedDate(0), slots: generateTimeSlots() },
        { day: 'Monday', date: getFormattedDate(2), slots: generateTimeSlots() },
        { day: 'Tuesday', date: getFormattedDate(3), slots: generateTimeSlots() },
        { day: 'Wednesday', date: getFormattedDate(4), slots: generateTimeSlots() },
        { day: 'Thursday', date: getFormattedDate(5), slots: generateTimeSlots() },
        { day: 'Friday', date: getFormattedDate(6), slots: generateTimeSlots() },
        { day: 'Saturday', date: getFormattedDate(0), slots: generateTimeSlots() },
    ];

    // Include the entire week starting from Monday if it's Sunday
    if (currentDayIndex === 0) {
        calendarController = [
            { day: 'Monday', date: getFormattedDate(2), slots: generateTimeSlots() },
            { day: 'Tuesday', date: getFormattedDate(3), slots: generateTimeSlots() },
            { day: 'Wednesday', date: getFormattedDate(4), slots: generateTimeSlots() },
            { day: 'Thursday', date: getFormattedDate(5), slots: generateTimeSlots() },
            { day: 'Friday', date: getFormattedDate(6), slots: generateTimeSlots() },
            { day: 'Saturday', date: getFormattedDate(7), slots: generateTimeSlots() }
        ]
    } else {
        // Filter days before the current day
        calendarController = calendarController.filter((_, index) => index >= currentDayIndex);
    }

    return (
        <>
            <main className='bg-[#060f17] flex items-center justify-center'>
                <main
                    style={{ background: 'linear-gradient(90deg, rgba(6,15,23,1) 0%, rgba(4,65,78,1) 48%, rgba(2,109,126,1) 76%, rgba(1,127,146,1) 100%, rgba(0,172,193,1) 100%, rgba(0,172,193,1) 100%, rgba(0,172,193,1) 100%)' }}
                    className='grid grid-cols-1 md:grid-cols-[30%,70%] '>

                    <section className='border-r-[1px] border-[#FFFFFF80] border-solid p-6 text-white md:sticky top-0 md:h-screen'>
                        <svg xmlns="http://www.w3.org/2000/svg" width="140" height="53" fill="none" viewBox="0 0 220 83"><rect width="196" height="51" x=".5" y=".5" fill="#fff" stroke="#00ACC1" rx="2.5" /><path fill="#00ACC1" d="M47 19.78c1.017 2.974 3.738 7.8 5.624 10.08l-3.679 2.422c-1.774-2.226-6.359-9.383-7.507-12.502H47Z" /><path fill="#00ACC1" d="M54.927 33.857c-.74-.98-3.585-5.786-3.585-5.786l-1.853 2.868-1.22.145s3.172 6.03 4.893 7.443c1.688 2.238 4.044 3.51 5.894 3.736 1.943.232 3.888-.785 5.673-3.523 1.218-1.878 2.348-4.495 3.324-7.987-1.284 2.597-5.278 13.513-13.126 3.104Z" /><path fill="#00ACC1" d="M46.755 42.029h-5.561s14.065-23.873 23.418-26.22l.02.028C55.099 24.946 46.756 42.03 46.756 42.03Z" /><path fill="#00ACC1" fillRule="evenodd" d="M48.32 13.805c.413-1.946 2.316-3.197 4.242-2.807 1.948.409 3.196 2.31 2.784 4.238a3.559 3.559 0 0 1-4.219 2.788 3.584 3.584 0 0 1-2.806-4.22Z" clipRule="evenodd" /><path fill="#00ACC1" d="M16.312 42h-5.808V14.16h15.958v4.836h-10.15v7.18h9.445v4.817h-9.445V42ZM31 20h6v22h-6zM74 0h143a3 3 0 0 1 3 3v46a3 3 0 0 1-3 3H74V0Z" /><path fill="#fff" d="M106.26 42h-5.884V29.984H89.35V42h-5.903V14.16h5.903v10.91h11.026V14.16h5.884V42Zm15.368-21.69c1.967 0 3.662.38 5.084 1.143 1.422.749 2.52 1.84 3.295 3.275.774 1.435 1.161 3.187 1.161 5.256v2.818h-13.73c.064 1.638.552 2.926 1.467 3.866.926.927 2.209 1.39 3.846 1.39 1.359 0 2.603-.14 3.733-.419 1.13-.28 2.291-.698 3.485-1.257v4.495c-1.054.52-2.159.9-3.314 1.142-1.143.241-2.533.362-4.17.362-2.133 0-4.025-.394-5.675-1.18-1.638-.788-2.926-1.988-3.866-3.6-.927-1.612-1.39-3.643-1.39-6.094 0-2.488.419-4.557 1.257-6.208.85-1.663 2.031-2.907 3.542-3.732 1.511-.838 3.269-1.257 5.275-1.257Zm.038 4.132c-1.13 0-2.07.362-2.819 1.086-.736.724-1.161 1.86-1.275 3.409h8.15c-.013-.864-.171-1.632-.476-2.305a3.576 3.576 0 0 0-1.333-1.6c-.584-.393-1.333-.59-2.247-.59Zm22.947-4.17c2.856 0 5.046.622 6.569 1.866 1.524 1.244 2.286 3.136 2.286 5.675V42h-4.057l-1.123-2.895h-.153c-.609.762-1.231 1.384-1.866 1.867a6.389 6.389 0 0 1-2.19 1.066c-.825.229-1.828.343-3.008.343-1.257 0-2.387-.241-3.39-.724-.99-.482-1.771-1.218-2.342-2.209-.572-1.003-.857-2.272-.857-3.808 0-2.26.793-3.923 2.38-4.99 1.587-1.079 3.967-1.675 7.141-1.79l3.695-.114v-.933c0-1.117-.292-1.936-.876-2.457-.584-.52-1.397-.78-2.438-.78-1.028 0-2.038.146-3.028.438-.99.292-1.98.66-2.971 1.104l-1.923-3.923c1.13-.596 2.393-1.066 3.79-1.409a18.389 18.389 0 0 1 4.361-.514Zm3.085 11.864-2.248.076c-1.878.05-3.186.387-3.922 1.01-.724.621-1.086 1.44-1.086 2.456 0 .888.26 1.523.781 1.904.52.368 1.2.552 2.037.552 1.245 0 2.292-.368 3.143-1.104.863-.736 1.295-1.784 1.295-3.142v-1.752ZM165.274 42h-5.808V12.37h5.808V42Zm15.082-4.247c.635 0 1.251-.063 1.847-.19.61-.127 1.213-.286 1.809-.476v4.323c-.622.279-1.396.508-2.323.685-.914.19-1.917.286-3.009.286-1.269 0-2.412-.203-3.427-.61-1.003-.419-1.797-1.136-2.381-2.151-.571-1.029-.857-2.457-.857-4.285V25.071h-2.78v-2.457l3.199-1.942 1.676-4.494h3.713v4.532h5.961v4.36h-5.961v10.265c0 .813.229 1.422.686 1.828.47.394 1.085.59 1.847.59Zm13.787-25.384v6.037c0 1.053-.038 2.056-.114 3.009a76.827 76.827 0 0 1-.152 2.018h.304c.457-.736.997-1.333 1.619-1.79a6.666 6.666 0 0 1 2.095-1.01 8.97 8.97 0 0 1 2.456-.323c1.536 0 2.876.273 4.018.819 1.143.533 2.032 1.377 2.666 2.533.635 1.142.953 2.628.953 4.456V42h-5.809V29.565c0-1.524-.279-2.672-.837-3.447-.559-.774-1.422-1.162-2.59-1.162s-2.089.274-2.762.82c-.672.533-1.148 1.326-1.428 2.38-.279 1.04-.419 2.317-.419 3.827V42h-5.808V12.37h5.808ZM15.945 79.477v-12.75h1.763v1.504h.15c.105-.194.256-.417.453-.67.198-.254.471-.476.821-.665.35-.193.813-.29 1.389-.29.748 0 1.416.19 2.004.568.588.378 1.049.924 1.383 1.636.338.712.507 1.57.507 2.572s-.167 1.861-.501 2.578c-.334.712-.793 1.261-1.377 1.648-.583.382-1.25.573-1.998.573-.564 0-1.024-.094-1.383-.284a2.617 2.617 0 0 1-.833-.664 5.02 5.02 0 0 1-.464-.676h-.11v4.92h-1.804Zm1.769-8.113c0 .652.094 1.223.283 1.714.19.491.463.876.821 1.153.359.274.797.41 1.316.41.54 0 .99-.142 1.353-.428.362-.29.636-.682.82-1.177.19-.495.285-1.053.285-1.672 0-.612-.093-1.162-.278-1.648-.181-.487-.455-.872-.821-1.153-.362-.282-.815-.423-1.358-.423-.524 0-.966.135-1.329.404-.358.27-.63.646-.815 1.13-.185.482-.277 1.046-.277 1.69ZM26.437 76v-9.273h1.745V68.2h.096c.17-.499.467-.891.894-1.177.43-.29.917-.435 1.46-.435a7.665 7.665 0 0 1 .767.043v1.726a3.25 3.25 0 0 0-.386-.066 3.697 3.697 0 0 0-.555-.042c-.427 0-.807.09-1.141.271a2.018 2.018 0 0 0-1.075 1.817V76h-1.805Zm10.189.187c-.914 0-1.7-.195-2.36-.585a3.972 3.972 0 0 1-1.522-1.66c-.354-.717-.531-1.556-.531-2.518 0-.95.177-1.787.531-2.511.358-.725.857-1.29 1.497-1.697.644-.406 1.397-.61 2.258-.61.523 0 1.03.087 1.521.26.491.173.932.445 1.322.815.39.37.699.851.924 1.443.226.588.338 1.302.338 2.143v.64h-7.37v-1.352h5.601c0-.475-.096-.896-.29-1.262a2.19 2.19 0 0 0-.814-.875c-.346-.214-.753-.32-1.22-.32-.507 0-.95.124-1.328.374a2.512 2.512 0 0 0-.87.966 2.788 2.788 0 0 0-.301 1.286v1.056c0 .62.109 1.147.326 1.582.221.434.53.767.923.996.395.225.856.338 1.383.338.342 0 .654-.048.936-.145a1.942 1.942 0 0 0 1.201-1.177l1.708.308a3.093 3.093 0 0 1-.736 1.322c-.35.374-.79.666-1.322.875-.527.206-1.129.308-1.805.308Zm13.648-9.46L46.91 76H44.98l-3.37-9.273h1.939l2.348 7.136h.097l2.342-7.136h1.938ZM51.97 76v-9.273h1.805V76H51.97Zm.912-10.704c-.314 0-.584-.104-.81-.313a1.02 1.02 0 0 1-.331-.761c0-.298.11-.551.332-.76.225-.214.495-.32.809-.32.314 0 .581.106.803.32a1 1 0 0 1 .338.76c0 .294-.113.547-.338.76-.222.21-.49.314-.803.314Zm7.228 10.891c-.87 0-1.628-.2-2.276-.597a4.03 4.03 0 0 1-1.51-1.673c-.358-.716-.537-1.553-.537-2.511 0-.962.18-1.803.537-2.524.359-.72.862-1.28 1.51-1.678.648-.398 1.406-.597 2.276-.597.869 0 1.627.199 2.276.597a4.022 4.022 0 0 1 1.509 1.678c.358.72.537 1.562.537 2.524 0 .958-.18 1.795-.537 2.511a4.03 4.03 0 0 1-1.51 1.672c-.648.399-1.406.598-2.275.598Zm.006-1.515c.563 0 1.03-.149 1.4-.447.37-.298.644-.694.821-1.19a4.73 4.73 0 0 0 .272-1.635c0-.592-.09-1.135-.272-1.63-.177-.5-.45-.9-.82-1.201-.371-.302-.838-.453-1.401-.453-.568 0-1.039.15-1.413.453-.37.301-.646.702-.827 1.2a4.808 4.808 0 0 0-.266 1.63c0 .597.089 1.142.266 1.637.181.495.457.891.827 1.19.374.297.845.446 1.413.446Zm12.205-2.517v-5.428h1.81V76h-1.774v-1.606h-.097a2.894 2.894 0 0 1-1.026 1.238c-.467.326-1.048.489-1.745.489-.595 0-1.122-.131-1.581-.393-.455-.265-.813-.658-1.075-1.177-.257-.519-.386-1.161-.386-1.926v-5.898h1.805v5.681c0 .632.175 1.135.525 1.51.35.373.805.56 1.364.56.338 0 .674-.084 1.009-.253.338-.169.617-.424.839-.766.225-.343.336-.777.332-1.305Zm11.185-3.164-1.636.29a1.938 1.938 0 0 0-.326-.598 1.613 1.613 0 0 0-.592-.465c-.25-.12-.561-.18-.936-.18-.51 0-.937.114-1.28.343-.342.226-.513.518-.513.876 0 .31.115.56.344.748.23.19.6.344 1.111.465l1.473.338c.853.197 1.49.501 1.908.912.419.41.628.944.628 1.6a2.43 2.43 0 0 1-.483 1.485c-.318.43-.763.768-1.334 1.014-.568.245-1.226.368-1.974.368-1.039 0-1.886-.221-2.542-.664-.656-.447-1.058-1.08-1.207-1.902l1.744-.265c.109.455.332.799.67 1.032.338.23.78.344 1.322.344.592 0 1.065-.123 1.42-.368.353-.25.53-.553.53-.912a.948.948 0 0 0-.326-.73c-.213-.197-.54-.346-.984-.447l-1.57-.344c-.865-.197-1.504-.511-1.919-.942-.41-.43-.616-.976-.616-1.636 0-.547.153-1.026.46-1.436.305-.411.728-.73 1.267-.96.54-.234 1.157-.35 1.853-.35 1.002 0 1.791.217 2.367.651.575.431.956 1.009 1.14 1.733Zm3.97-5.355V76h-1.805V63.636h1.805Zm3.57 15.841c-.27 0-.515-.022-.737-.066a2.324 2.324 0 0 1-.495-.133l.435-1.479c.33.088.624.127.881.115.258-.012.485-.109.683-.29.2-.181.378-.477.53-.887l.224-.616-3.393-9.394h1.932l2.349 7.196h.096l2.349-7.196h1.937l-3.821 10.51a4.195 4.195 0 0 1-.676 1.226c-.274.338-.6.592-.978.76-.378.17-.817.254-1.316.254Zm12.123-15.84h2.928l2.82 5.324h.12l2.82-5.325h2.928l-4.51 7.993V76h-2.596v-4.37l-4.51-7.994Zm15.242 12.544c-.938 0-1.748-.2-2.433-.597a4.088 4.088 0 0 1-1.575-1.679c-.371-.72-.556-1.555-.556-2.505 0-.958.185-1.795.556-2.512a4.04 4.04 0 0 1 1.575-1.678c.685-.402 1.495-.603 2.433-.603.938 0 1.747.2 2.427.603a4.037 4.037 0 0 1 1.582 1.678c.37.717.555 1.554.555 2.512 0 .95-.185 1.785-.555 2.505a4.085 4.085 0 0 1-1.582 1.678c-.68.399-1.489.598-2.427.598Zm.012-1.992c.427 0 .783-.12 1.069-.362.286-.246.501-.58.646-1.002.149-.423.223-.904.223-1.443 0-.54-.074-1.02-.223-1.443-.145-.423-.36-.757-.646-1.002-.286-.246-.642-.368-1.069-.368-.43 0-.793.122-1.086.368-.29.245-.509.58-.658 1.002a4.434 4.434 0 0 0-.218 1.443c0 .539.073 1.02.218 1.443.149.422.368.756.658 1.002.293.241.656.362 1.086.362Zm12.171-2.137v-5.325h2.571V76h-2.469v-1.684h-.096c-.209.543-.558.98-1.045 1.31-.483.33-1.072.495-1.768.495-.62 0-1.166-.141-1.636-.423a2.901 2.901 0 0 1-1.105-1.201c-.262-.52-.395-1.141-.399-1.866v-5.904h2.572v5.446c.004.547.151.98.441 1.297.29.319.678.477 1.165.477.31 0 .6-.07.869-.21.27-.146.487-.359.652-.64.169-.282.252-.63.248-1.045ZM135.223 76v-9.273h2.493v1.618h.096c.169-.575.453-1.01.852-1.304a2.236 2.236 0 0 1 1.376-.447 3.895 3.895 0 0 1 .809.091v2.282a3.38 3.38 0 0 0-.501-.097 4.5 4.5 0 0 0-.586-.042c-.378 0-.716.083-1.014.248a1.82 1.82 0 0 0-.7.676c-.169.29-.254.624-.254 1.002V76h-2.571Zm7.004 0V63.636h4.878c.937 0 1.736.18 2.396.538a3.64 3.64 0 0 1 1.51 1.479c.35.627.525 1.352.525 2.173s-.177 1.545-.531 2.173a3.671 3.671 0 0 1-1.54 1.467c-.668.35-1.477.526-2.427.526h-3.109v-2.095h2.687c.503 0 .917-.087 1.243-.26.33-.177.576-.42.737-.73.165-.314.247-.674.247-1.081 0-.41-.082-.769-.247-1.075a1.654 1.654 0 0 0-.737-.718c-.33-.173-.748-.26-1.255-.26h-1.763V76h-2.614Zm13.53-5.36V76h-2.572V63.636h2.5v4.727h.108a2.63 2.63 0 0 1 1.015-1.286c.466-.314 1.052-.47 1.756-.47.644 0 1.206.14 1.685.422.483.278.857.678 1.123 1.202.269.519.402 1.14.398 1.865V76h-2.572v-5.445c.004-.572-.141-1.017-.434-1.335-.29-.317-.697-.476-1.22-.476-.35 0-.66.074-.93.223a1.586 1.586 0 0 0-.627.652c-.149.282-.226.622-.23 1.02Zm9.293 8.837c-.326 0-.632-.026-.918-.078a3.33 3.33 0 0 1-.7-.187l.579-1.92c.302.093.574.143.815.15.246.009.457-.047.634-.168.181-.12.328-.326.441-.616l.151-.392-3.327-9.539h2.705l1.92 6.81h.096l1.938-6.81h2.723l-3.604 10.275c-.173.5-.409.934-.707 1.304a2.892 2.892 0 0 1-1.116.863c-.451.206-.995.308-1.63.308Zm16.088-10.106-2.354.145a1.224 1.224 0 0 0-.26-.543 1.381 1.381 0 0 0-.525-.392c-.214-.101-.469-.151-.767-.151-.398 0-.734.084-1.008.253-.274.165-.411.387-.411.664 0 .222.089.409.266.562.177.153.481.275.912.368l1.678.338c.901.185 1.573.483 2.016.894.443.41.664.95.664 1.617 0 .608-.179 1.141-.537 1.6-.354.459-.841.817-1.461 1.075-.616.253-1.326.38-2.131.38-1.228 0-2.205-.255-2.934-.767a2.99 2.99 0 0 1-1.274-2.1l2.53-.133c.076.374.261.66.555.857.294.193.67.29 1.129.29.451 0 .813-.087 1.087-.26.277-.177.418-.404.422-.682a.708.708 0 0 0-.296-.573c-.193-.153-.491-.27-.893-.35l-1.606-.32c-.905-.182-1.58-.496-2.022-.942-.439-.447-.658-1.017-.658-1.709 0-.596.161-1.109.483-1.54.326-.43.783-.762 1.37-.995.592-.234 1.284-.35 2.077-.35 1.171 0 2.093.247 2.765.742.676.495 1.07 1.17 1.183 2.022ZM182.969 76v-9.273h2.571V76h-2.571Zm1.292-10.468c-.383 0-.711-.127-.984-.38a1.232 1.232 0 0 1-.405-.924c0-.354.135-.658.405-.912.273-.257.601-.386.984-.386.382 0 .708.129.978.386.273.254.41.558.41.912 0 .358-.137.666-.41.924-.27.253-.596.38-.978.38Zm7.529 10.65c-.938 0-1.749-.2-2.433-.599a4.088 4.088 0 0 1-1.575-1.678c-.371-.72-.556-1.555-.556-2.505 0-.958.185-1.795.556-2.512a4.04 4.04 0 0 1 1.575-1.678c.684-.402 1.495-.603 2.433-.603.938 0 1.747.2 2.427.603a4.037 4.037 0 0 1 1.582 1.678c.37.717.555 1.554.555 2.512 0 .95-.185 1.785-.555 2.505a4.085 4.085 0 0 1-1.582 1.678c-.68.399-1.489.598-2.427.598Zm.012-1.993c.427 0 .783-.12 1.069-.362.285-.246.501-.58.646-1.002.149-.423.223-.904.223-1.443 0-.54-.074-1.02-.223-1.443-.145-.423-.361-.757-.646-1.002-.286-.246-.642-.368-1.069-.368-.43 0-.793.122-1.086.368-.29.245-.51.58-.658 1.002a4.434 4.434 0 0 0-.218 1.443c0 .539.073 1.02.218 1.443.148.422.368.756.658 1.002.293.241.656.362 1.086.362Z" /></svg>
                        <div className='border-b-[1px] border-[#FFFFFF80] border-solid'>
                            <p className='py-5'>Fixhealth would like to know the days you are available for an appointment! Pick a time & date.</p>
                        </div>

                    </section>

                    <section className='flex flex-col items-start p-6'>

                        <div className='md:mb-5 hidden md:flex items-center gap-6 justify-between  w-full '>
                            <span className=' text-white text-xl'>Hello {clientId}</span>
                            <span onClick={() => [localStorage.clear('userInfo'), navigate('/')]} className='text-white'>Logout</span>
                        </div>

                        <div className='md:border-t-[1px] border-[#FFFFFF80] border-solid w-full md:mb-6'></div>
                        <div className='grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-8'>
                            {calendarController.map((item, index) => (
                                <div key={index} className='flex flex-col text-white gap-3'>
                                    <ul className='flex flex-col items-center'>
                                        <li className='font-semibold'>{item.day}</li>
                                        <li>{item.date}</li>
                                    </ul>
                                    {item.slots.map((element, idx) => {
                                        const isSelected = selectedDates.find(
                                            (date) => date.date === item.date
                                        )?.selectedSlots.some(
                                            (slot) => slot.timestamp === element.timestamp
                                        );

                                        return (
                                            <span
                                                key={idx}
                                                onClick={() => handleClick(item.day, item.date, element)}
                                                className={`px-8 py-2 whitespace-nowrap rounded-md text-center relative  ${currentDayIndex === 0 ? 'cursor-pointer' : 'cursor-not-allowed'
                                                    } ${isSelected
                                                        ? 'bg-[#00acc1] ' // Color for selected slots
                                                        : 'bg-[#FFFFFF80] ' // Default color
                                                    }`}
                                            >
                                                {element.timestamp}
                                            </span>
                                        );
                                    })}
                                </div>
                            ))}
                        </div>
                        <div className='border-t-[1px] border-[#FFFFFF80] border-solid w-full mt-10 mb-5'></div>
                        <button
                            onClick={handleSubmit}
                            className='bg-[#081c1f] px-10 py-2 text-white  rounded-md shadow-sm shadow-[#00acc1] font-light'
                        >
                            SAVE
                        </button>
                    </section>
                </main>
            </main>



        </>
    )
}

export default Physioview