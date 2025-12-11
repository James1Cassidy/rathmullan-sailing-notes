// Firebase Config
const firebaseConfig = {
    apiKey: "AIzaSyBKwElTmL2vxEb6-pTH9B0eSxYRyV72To4",
    authDomain: "sailingrathmullan.firebaseapp.com",
    databaseURL: "https://sailingrathmullan-default-rtdb.europe-west1.firebasedatabase.app",
    projectId: "sailingrathmullan",
    storageBucket: "sailingrathmullan.firebasestorage.app",
    messagingSenderId: "677092232533",
    appId: "1:677092232533:web:61610c76e7cfd3689db3dc",
    measurementId: "G-5XTZ65J3TN"
};

// Initialize Firebase
if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
} else {
    firebase.app(); // reuse existing app
}
const db = firebase.database();
window.db = db; // Expose db globally for inline scripts
window.firebase = firebase; // Ensure firebase is globally accessible
const auth = firebase.auth();
const storage = firebase.storage();

// --- Firebase Messaging (FCM) client integration ---
// Note: `firebase-messaging.js` is included in pages that use messaging (instructors.html).
let messaging = null;
try {
    if (firebase && firebase.messaging && 'serviceWorker' in navigator) {
        messaging = firebase.messaging();
    }
} catch (e) {
    console.warn('Firebase Messaging init warning:', e.message);
}

// --- SAILING SKILLS CHECKLIST DATA ---
// Exact competencies from SBSS Joe Soap Sheets 2016 with section groupings
const SAILING_SKILLS = {
    'taste-of-sailing': {
        level: 'Taste of Sailing',
        sections: [
            {
                name: 'Clothing & Equipment',
                competencies: [
                    { id: 'tos-1', skill: 'Can explain why personal buoyancy is worn when afloat. (Safety & legislation)' },
                    { id: 'tos-2', skill: 'Can identify the limitations of a Buoyancy Aid (50N PFD) as against a Life jacket (> 150N PFD)' }
                ]
            },
            {
                name: 'Sailing Techniques & Manoeuvres',
                competencies: [
                    { id: 'tos-3', skill: 'The sailor should be able to identify where the wind is coming from' },
                    { id: 'tos-4', skill: 'Can use tiller extension' },
                    { id: 'tos-5', skill: 'Can keep the sail filled' },
                    { id: 'tos-6', skill: 'Can stop the boat at will by letting out the sail' },
                    { id: 'tos-7', skill: 'Can get under way by sheeting in and bearing away' },
                    { id: 'tos-8', skill: 'Can turn the boat in the vicinity of a mark' },
                    { id: 'tos-9', skill: 'Is balancing the boat' },
                    { id: 'tos-10', skill: 'Can lower and raise the centre / dagger board and rudder when leaving and coming back to shore' }
                ]
            },
            {
                name: 'Capsize Recovery',
                competencies: [
                    { id: 'tos-11', skill: 'Can explain why they must always maintain contact with capsized boat' },
                    { id: 'tos-12', skill: 'Can explain why they should never swim for shore' },
                    { id: 'tos-13', skill: 'Can explain how to minimise the risk of full inversions (Don\'t hang onto top gunwale)' }
                ]
            },
            {
                name: 'What Next',
                competencies: [
                    { id: 'tos-14', skill: 'Is aware that the next step for people completing this course is "Start Sailing"' },
                    { id: 'tos-15', skill: 'Can identify why they should do this course and where to find information on it and course providers' }
                ]
            }
        ]
    },
    'start-sailing': {
        level: 'Start Sailing',
        sections: [
            {
                name: 'Clothing & Equipment',
                competencies: [
                    { id: 'ss-1', skill: 'Can describe why they might / should /should not wear; Hats, sun glasses, gloves, footwear, wetsuits, drysuits, waterproofs' },
                    { id: 'ss-2', skill: 'Describe the relative merits of cotton, wool & man made fibres when used afloat' },
                    { id: 'ss-3', skill: 'Can identify the difference between buoyancy aids & lifejackets' },
                    { id: 'ss-4', skill: 'Can explain what the ISO/EN number & pictograms mean' },
                    { id: 'ss-5', skill: 'Can explain why they are using the type of PFDs that they are for this activity' },
                    { id: 'ss-6', skill: 'Can describe where & when your organisation expects they to wear their PFD' },
                    { id: 'ss-7', skill: 'Can put on and adjust their own PFD' }
                ]
            },
            {
                name: 'Rigging',
                competencies: [
                    { id: 'ss-8', skill: 'Can identify where the wind is blowing from' },
                    { id: 'ss-9', skill: 'Can position their boat head to wind and can do so in an appropriate are free from hazards (overhead lines, fences, other boats & sailors etc.)' },
                    { id: 'ss-10', skill: 'Can identify parts of the hull - bow, stern, rudder, tiller & centre / daggerboard, bungs' },
                    { id: 'ss-11', skill: 'Can identify parts of the rigging - mast, boom, halyards, stays / shrouds & kicking strap, sheets' },
                    { id: 'ss-12', skill: 'Can identify sails & sail parts - mainsail, jib, clew, foot, luff, leach' },
                    { id: 'ss-13', skill: 'Has assisted instructor in rigging boat' }
                ]
            },
            {
                name: 'Ropework',
                competencies: [
                    { id: 'ss-14', skill: 'Can tie and describe when to use a figure of eight knot' },
                    { id: 'ss-15', skill: 'Can tie and describe when to use a round turn and two half hitches' },
                    { id: 'ss-16', skill: 'Can secure a rope using a Cam Cleat (as used on jib & main sheets)' },
                    { id: 'ss-17', skill: 'Can secure a rope using a Horned cleat (as on marinas)' },
                    { id: 'ss-18', skill: 'Can secure a rope using a Jam cleat (often used on tiller to hold down rudder)' },
                    { id: 'ss-19', skill: 'Can coil a line by flaking it into one hand and secure it to stop it uncoiling' },
                    { id: 'ss-20', skill: 'Can throw one end of a coiled line' }
                ]
            },
            {
                name: 'Launch & Recovery',
                competencies: [
                    { id: 'ss-21', skill: 'Can secure a boat to its trolley and tie down' },
                    { id: 'ss-22', skill: 'Can demonstrate the correct way to lift a boat' },
                    { id: 'ss-23', skill: 'Can move their boat around the dinghy park without colliding with other boats' },
                    { id: 'ss-24', skill: 'Can identify the hazard presented by overhead cables' },
                    { id: 'ss-25', skill: 'Can safely manoeuvre the boat on the trolley with the sails up' },
                    { id: 'ss-26', skill: 'Can, with assistance, launch their boat and sail away from the shore' },
                    { id: 'ss-27', skill: 'Can lower their centre/dagger board and rudder' },
                    { id: 'ss-28', skill: 'Can park their trolley while they are on the water. (tide & other slip users)' },
                    { id: 'ss-29', skill: 'Can, with assistance, return to the shore, recover their boat on to its trolley and drop the sails' },
                    { id: 'ss-30', skill: 'When approaching shore, can slow the boat down and raise the centre/dagger board and rudder to avoid grounding them' },
                    { id: 'ss-31', skill: 'Can secure their boat alongside' },
                    { id: 'ss-32', skill: 'Can secure their boat to a mooring' }
                ]
            },
            {
                name: 'Sailing Techniques & Manoeuvres',
                competencies: [
                    { id: 'ss-33', skill: 'Can paddle or row a boat in a straight line' },
                    { id: 'ss-34', skill: 'It is vital that in two person boats, sailors spend equal amounts of time as both helm and crew' },
                    { id: 'ss-35', skill: 'Can reach the boat across the wind while controlling speed and avoiding obstacles' },
                    { id: 'ss-36', skill: 'Can sail the boat close to the wind and while doing so steer a reasonably constant course avoiding unintended tacks maintaining proper sheeting positions keeping the boat balanced' },
                    { id: 'ss-37', skill: 'Can sail the boat down wind on a training run (very broad reach but not dead run) while steering a reasonably constant course avoiding unintended gybes maintain correct sail setting' },
                    { id: 'ss-38', skill: 'Can tack the boat through the wind, from close reach to close reach while maintaining boat speed through the manoeuvre maintaining an awareness of, and avoiding other water users maintaining control of the boat before, during and after the manoeuvre using the tiller extension if normally fitted to type of boat keeping crew informed of intentions & progress' },
                    { id: 'ss-39', skill: 'Can gybe the boat, from training run and avoid luffing up beyond a reach, while maintaining boat speed through the manoeuvre maintaining an awareness of, and avoiding other water users maintaining control of the boat before, during and after the manoeuvre using the tiller extension if normally fitted to type of boat keeping crew informed of intentions & progress' },
                    { id: 'ss-40', skill: 'Can get the boat out of irons' },
                    { id: 'ss-41', skill: 'Can stop the boat' }
                ]
            },
            {
                name: 'Sailing Knowledge',
                competencies: [
                    { id: 'ss-42', skill: 'Can describe the different points of sailing - Beam reach, Run, Training Run, Close hauled' },
                    { id: 'ss-43', skill: 'Can take the correct action when boats on different tacks meet' },
                    { id: 'ss-44', skill: 'Can describe how tides and currents can affect them' },
                    { id: 'ss-45', skill: 'Can identify when sailors are required to wear PFDs by law' },
                    { id: 'ss-46', skill: 'Can identify and use common sailing terms - Sheet in, sheet out, luff up, bear away, up wind, down wind, tacking, gybing, in irons' }
                ]
            },
            {
                name: 'Coastal Knowledge',
                competencies: [
                    { id: 'ss-47', skill: 'Can describe how often high and low tides occur' },
                    { id: 'ss-48', skill: 'Can describe implications of tides on activities' }
                ]
            },
            {
                name: 'Weather',
                competencies: [
                    { id: 'ss-49', skill: 'Can describe how onshore and offshore winds can affect their sailing activity & safety' },
                    { id: 'ss-50', skill: 'Can describe how high winds can affect their sailing activity & safety' },
                    { id: 'ss-51', skill: 'Can describe how no wind can affect their sailing activity & safety' }
                ]
            },
            {
                name: 'Safety',
                competencies: [
                    { id: 'ss-52', skill: 'Can describe what details to leave about what they are doing onshore and who to leave it with' },
                    { id: 'ss-53', skill: 'Can describe how to summon assistance while they are on/in the water' },
                    { id: 'ss-54', skill: 'Can describe how to summon assistance for someone else who is on/in the water' }
                ]
            },
            {
                name: 'What Next',
                competencies: [
                    { id: 'ss-55', skill: 'Are aware that the next step for people completing this course is "Basic Skills"' },
                    { id: 'ss-56', skill: 'Can identify why they should do this course and where to find information on it and course providers' }
                ]
            }
        ]
    },
    'basic-skills': {
        level: 'Basic Skills',
        sections: [
            {
                name: 'Clothing & Equipment',
                competencies: [
                    { id: 'bs-1', skill: 'Can decide what to wear before going sailing' },
                    { id: 'bs-2', skill: 'Can equip a sailing boat for use' },
                    { id: 'bs-3', skill: 'Can check integrity of hull, buoyancy, rigging, spars & foils' }
                ]
            },
            {
                name: 'Rigging',
                competencies: [
                    { id: 'bs-4', skill: 'Can identify all of the parts of the boat, rigging & sails' },
                    { id: 'bs-5', skill: 'Can rig a boat for use on their own' },
                    { id: 'bs-6', skill: 'Can make appropriate decisions as to what sails to use or whether or not they should reef' },
                    { id: 'bs-7', skill: 'Can identify effect of outhaul on the sail and its use in lighter & stronger winds' },
                    { id: 'bs-8', skill: 'Can wash, dry equipment, roll/fold sails, coil lines, fit covers' },
                    { id: 'bs-9', skill: 'Can rig a slab or roll reef boat while on the trolley' },
                    { id: 'bs-10', skill: 'Keelboat sailors can reef their boat while on a mooring' }
                ]
            },
            {
                name: 'Ropework',
                competencies: [
                    { id: 'bs-11', skill: 'Can tie a bowline and describe when to use it' },
                    { id: 'bs-12', skill: 'Can tie a clove hitch and describe when to use it' }
                ]
            },
            {
                name: 'Launch & Recovery',
                competencies: [
                    { id: 'bs-13', skill: 'Can launch a boat and sail away from shore' },
                    { id: 'bs-14', skill: 'Can sail back to shore and recover a boat' },
                    { id: 'bs-15', skill: 'Identify different methods of launching a keelboat' },
                    { id: 'bs-16', skill: 'Can describe how to launch a keelboat from a trailer using a slipway' }
                ]
            },
            {
                name: 'Sailing Techniques & Manoeuvres',
                competencies: [
                    { id: 'bs-17', skill: 'Can paddle or row a boat around a triangular course and come alongside' },
                    { id: 'bs-18', skill: 'Can leave and return to a beach or slipway in the prevailing wind direction' },
                    { id: 'bs-19', skill: 'Can describe how to land on a beach or slipway when the wind is offshore, cross shore and onshore' },
                    { id: 'bs-20', skill: 'Can reach across the wind' },
                    { id: 'bs-21', skill: 'Can sail up wind' },
                    { id: 'bs-22', skill: 'Can sail down wind' },
                    { id: 'bs-23', skill: 'Can tack the boat' },
                    { id: 'bs-24', skill: 'Can gybe the boat' },
                    { id: 'bs-25', skill: 'Can pick up and leave a mooring' },
                    { id: 'bs-26', skill: 'Can come alongside and leave a boat, pier, pontoon that is head to wind' },
                    { id: 'bs-27', skill: 'Can come alongside and leave a pier or pontoon that is not head to wind' },
                    { id: 'bs-28', skill: 'Can recover a man overboard' },
                    { id: 'bs-29', skill: 'Can heave to' },
                    { id: 'bs-30', skill: 'Can sail under jib only' },
                    { id: 'bs-31', skill: 'Can describe "The 5 Essentials" and apply them to all points of sailing' },
                    { id: 'bs-32', skill: 'Can use a trapeze if carried' },
                    { id: 'bs-33', skill: 'Can change a headsail' }
                ]
            },
            {
                name: 'Capsize Recovery',
                competencies: [
                    { id: 'bs-34', skill: 'Can right a capsized boat' },
                    { id: 'bs-35', skill: 'Can describe what to do if they are caught under an inverted boat' }
                ]
            },
            {
                name: 'Sailing Knowledge',
                competencies: [
                    { id: 'bs-36', skill: 'Can describe how a sail works' },
                    { id: 'bs-37', skill: 'Can describe how a centre / dagger board works' },
                    { id: 'bs-38', skill: 'Can tell if risk of collision exist between two boats' },
                    { id: 'bs-39', skill: 'Can describe what should happen when a motor boat and sailing boat meet' },
                    { id: 'bs-40', skill: 'Can describe what should happen when two sailing boats on the same tack meet' },
                    { id: 'bs-41', skill: 'Can describe what should happen when boats are being overtaken' }
                ]
            },
            {
                name: 'Coastal Knowledge',
                competencies: [
                    { id: 'bs-42', skill: 'Can identify when high and low tide occur using local tide tables' },
                    { id: 'bs-43', skill: 'Can describe how to estimate the rate and direction of the flow of tide and describe the effect that this might have on a sailor' }
                ]
            },
            {
                name: 'Weather',
                competencies: [
                    { id: 'bs-44', skill: 'Can describe how wind speed is measured and how it may affect a sailor - Beaufort scale, knots, Kph' },
                    { id: 'bs-45', skill: 'Can describe how wind direction is measured and how it may affect a sailor - Compass headings, onshore & offshore winds' },
                    { id: 'bs-46', skill: 'Can describe how visibility is measured and how it may affect a sailor - Hazards associated with fog' },
                    { id: 'bs-47', skill: 'Can describe how temperature is measured and how it may affect a sailor- Actual and effects of wind chill' },
                    { id: 'bs-48', skill: 'Can obtain a weather forecast for a sailing area and describe how it might affect their planned activities' }
                ]
            },
            {
                name: 'Safety',
                competencies: [
                    { id: 'bs-49', skill: 'Can explain the importance of telling someone where they are going and when they will be back' },
                    { id: 'bs-50', skill: 'Can describe how to use and care for distress flares' },
                    { id: 'bs-51', skill: 'Can describe how to care for someone who is very cold' },
                    { id: 'bs-52', skill: 'Can explain why it is important for a sailor to have some training in Emergency Care' }
                ]
            },
            {
                name: 'What Next',
                competencies: [
                    { id: 'bs-53', skill: 'Can describe how to continue sailing and develop their sailing skills and knowledge' }
                ]
            }
        ]
    },
    'improving-skills': {
        level: 'Improving Skills',
        sections: [
            {
                name: 'Rigging',
                competencies: [
                    { id: 'is-1', skill: 'Can rig their own boats' },
                    { id: 'is-2', skill: 'Can de-rig the boat' },
                    { id: 'is-3', skill: 'Care for sails by washing, drying, folding/rolling up and stowing in sail bags' },
                    { id: 'is-4', skill: 'Care for hull by washing, bailing, drying, fitting covers' },
                    { id: 'is-5', skill: 'Check for damage, tidy sheets and lines, and secure equipment' }
                ]
            },
            {
                name: 'Tuning',
                competencies: [
                    { id: 'is-6', skill: 'Can identify and demonstrate / describe the use of sail telltales in order to optimise a boat / rig for a particular set of conditions' },
                    { id: 'is-7', skill: 'Can identify and demonstrate / describe the use of jib sheeting angles in order to optimise a boat / rig for a particular set of conditions' },
                    { id: 'is-8', skill: 'Can identify and demonstrate / describe the use of halyard tension in order to optimise a boat / rig for a particular set of conditions' },
                    { id: 'is-9', skill: 'Can identify and demonstrate / describe the use of outhaul in order to optimise a boat / rig for a particular set of conditions' },
                    { id: 'is-10', skill: 'Can identify and demonstrate / describe the use of Cunningham / downhaul in order to optimise a boat / rig for a particular set of conditions' },
                    { id: 'is-11', skill: 'Can identify and demonstrate / describe the use of kicker or vang in order to optimise a boat / rig for a particular set of conditions' },
                    { id: 'is-12', skill: 'Can identify and demonstrate / describe the use of main sheet traveller in order to optimise a boat / rig for a particular set of conditions' },
                    { id: 'is-13', skill: 'Can use boat and rig controls to optimise the performance of a boat in a variety of conditions including light, medium and moderate wind conditions and on all points of sailing' }
                ]
            },
            {
                name: 'Boat Handling',
                competencies: [
                    { id: 'is-14', skill: 'Can tack effectively in all wind conditions' },
                    { id: 'is-15', skill: 'Can gybe effectively in all wind conditions' },
                    { id: 'is-16', skill: 'Can perform a basic roll tack in light wind conditions' },
                    { id: 'is-17', skill: 'Can perform a basic roll gybe in light wind conditions' },
                    { id: 'is-18', skill: 'Pick up a mooring in moderate conditions and with little or no assistance from the instructor' },
                    { id: 'is-19', skill: 'Safely approach, come alongside and leave a pier or pontoon allowing for wind and current in moderate conditions and with little or no assistance from the instructor' },
                    { id: 'is-20', skill: 'Can consistently recover a man overboard in moderate conditions and with little or no assistance from the instructor' },
                    { id: 'is-21', skill: 'Sail effectively under jib only in moderate conditions' },
                    { id: 'is-22', skill: 'Can describe the principles of sailing without a rudder and sail a beam reach without a rudder' },
                    { id: 'is-23', skill: 'Can sail backwards for short distances' }
                ]
            },
            {
                name: 'Capsize Recovery',
                competencies: [
                    { id: 'is-24', skill: 'Can confidently use a trapeze if carried' },
                    { id: 'is-25', skill: 'Will know how to get the centre/ dagger board down if it has retracted' },
                    { id: 'is-26', skill: 'Will know how to break a vacuum formed under the hull' },
                    { id: 'is-27', skill: 'Will know how to tell if mast is stuck in bottom and what to/ not to do if it is' },
                    { id: 'is-28', skill: 'Can describe what to do if someone is caught under an inverted boat' }
                ]
            },
            {
                name: 'Boat Speed',
                competencies: [
                    { id: 'is-29', skill: 'Are constantly aware of and apply "The 5 Essentials"' },
                    { id: 'is-30', skill: 'Can set the boat up' },
                    { id: 'is-31', skill: 'Can sail efficiently up wind' },
                    { id: 'is-32', skill: 'Can sail efficiently down wind' },
                    { id: 'is-33', skill: 'Can sail efficiently on a reach' },
                    { id: 'is-34', skill: 'Can demonstrate how to obtain maximum leverage when hiking' },
                    { id: 'is-35', skill: 'Can demonstrate use of optimum sheeting on all points of sailing' }
                ]
            },
            {
                name: 'Weather',
                competencies: [
                    { id: 'is-36', skill: 'Can describe how wind speed, wind direction, visibility, precipitation and temperature can affect planned activities' },
                    { id: 'is-37', skill: 'Can find forecasts on radio, VHF radio, television, internet, phone, fax & newspapers as well as identify strengths & weaknesses of each types of forecast service' },
                    { id: 'is-38', skill: 'Can explain the significance of commonly used terms in marine forecasts (isobars, areas of high & low pressure, cold & warm fronts)' },
                    { id: 'is-39', skill: 'Can identify the significance to sailors of common weather patterns illustrated on synoptic chart' },
                    { id: 'is-40', skill: 'Can obtain a forecast for the day and then explain how the weather it predicts will affect the sailing area & activities planned for the day' }
                ]
            },
            {
                name: 'Coastal Knowledge',
                competencies: [
                    { id: 'is-41', skill: 'Can describe what causes tides and how neap and spring tides might affect sailors' }
                ]
            },
            {
                name: 'Sailing Knowledge',
                competencies: [
                    { id: 'is-42', skill: 'Can explain how centre of effort (sails) & centre of lateral resistance (hull & foils) interact to drive boat forwards and to steer the boat' },
                    { id: 'is-43', skill: 'Can describe how sails & foils generate lift and what stalling is' }
                ]
            },
            {
                name: 'What Next',
                competencies: [
                    { id: 'is-44', skill: 'Can describe how to continue sailing and develop their sailing skills and knowledge' }
                ]
            }
        ]
    },
    'advanced': {
        level: 'Advanced Boat Handling',
        sections: [
            {
                name: 'Rigging',
                competencies: [
                    { id: 'adv-1', skill: 'Can rig any sailing boat' }
                ]
            },
            {
                name: 'Tuning',
                competencies: [
                    { id: 'adv-2', skill: 'Can identify and demonstrate / describe the use of mast rake in order to optimise the boat / rig for a particular set of conditions' },
                    { id: 'adv-3', skill: 'Can identify and demonstrate / describe the use of rig tension in order to optimise the boat / rig for a particular set of conditions' },
                    { id: 'adv-4', skill: 'Can identify and demonstrate / describe the use of spreader length & angle in order to optimise the boat / rig for a particular set of conditions' },
                    { id: 'adv-5', skill: 'Can identify and demonstrate / describe the use of mast ram / chocks in order to optimise the boat / rig for a particular set of conditions' },
                    { id: 'adv-6', skill: 'Can use boat and rig controls to optimise the performance of the boat in a variety of conditions' }
                ]
            },
            {
                name: 'Boat Handling',
                competencies: [
                    { id: 'adv-7', skill: 'Can safely pick up a mooring in all wind / tide conditions independent of the instructor' },
                    { id: 'adv-8', skill: 'Can safely approach, come alongside and leave a pier or pontoon allowing for wind and current in all conditions independent of the instructor' },
                    { id: 'adv-9', skill: 'Can consistently recover a man overboard in all conditions independent of the instructor' },
                    { id: 'adv-10', skill: 'Can set up and control a boat while on a plane' },
                    { id: 'adv-11', skill: 'Can perform an effective roll tack in all wind strengths' },
                    { id: 'adv-12', skill: 'Can perform an effective roll gybe in all wind strengths' },
                    { id: 'adv-13', skill: 'Can sail a tight circular course in moderate conditions' },
                    { id: 'adv-14', skill: 'Can follow the leader in moderate conditions' },
                    { id: 'adv-15', skill: 'Can sail effectively on all points of sail without a rudder in moderate conditions' }
                ]
            },
            {
                name: 'Boat Speed',
                competencies: [
                    { id: 'adv-16', skill: 'Demonstrate techniques for maximising speed in waves' },
                    { id: 'adv-17', skill: 'Demonstrate optimum course to steer and steering technique on all points of sailing' },
                    { id: 'adv-18', skill: 'Demonstrate adaptation of 5 Essentials to suit boat / prevailing conditions' }
                ]
            },
            {
                name: 'Sailing Knowledge',
                competencies: [
                    { id: 'adv-19', skill: 'Describe how to optimise effectiveness of hull, spars and sails within class rules' },
                    { id: 'adv-20', skill: 'Describe how sails interact and demonstrate techniques to maximise this effect' },
                    { id: 'adv-21', skill: 'Can demonstrate a range of activities designed to develop and practice specific aspects of boat handling & boat speed' }
                ]
            },
            {
                name: 'What Next',
                competencies: [
                    { id: 'adv-22', skill: 'Can describe how to continue sailing and develop their sailing skills and knowledge' }
                ]
            }
        ]
    }
};

// Assessment states for skills
const SKILL_ASSESSMENT_STATES = {
    'not_assessed': 'Not Yet Assessed',
    'not_demonstrated': 'Not Demonstrated',
    'partially_achieved': 'Partially Achieved',
    'achieved': 'Achieved'
};

// --- Auth State Listener (handles user login/logout) ---
auth.onAuthStateChanged(async (user) => {
    if (!user) {
        // User is signed out - detach listener and show login page
        if (userRecordListener) {
            try { userRecordListener.off(); } catch (_) {}
            userRecordListener = null;
        }
        showLogin();
        return;
    }

    try {
        // Detach previous user record listener
        if (userRecordListener) {
            try { userRecordListener.off(); } catch (_) {}
            userRecordListener = null;
        }

        const userRef = db.ref('users/' + user.uid);
        userRecordListener = userRef;

        const handleUserSnapshot = async (snapshot) => {
            const userData = snapshot.val();

            // If user data doesn't exist (legacy users or direct firebase console creations), create pending record
            if (!userData) {
                let recentUid = null;
                try { recentUid = sessionStorage.getItem('__recentSignupUid'); } catch (_) { recentUid = null; }
                if (recentUid && recentUid === user.uid) {
                    console.log('[DEBUG][auth.onAuthStateChanged] recent signup detected, skipping duplicate DB write', { uid: user.uid, ts: Date.now() });
                    showPendingApproval();
                    return;
                }
                console.log('[DEBUG][auth.onAuthStateChanged] creating default user record', { uid: user.uid, email: user.email, ts: Date.now() });
                await userRef.set({ email: user.email, approved: false, role: 'instructor' });
                showPendingApproval();
                return;
            }

            currentUserName = userData.name || (user.email ? user.email.split('@')[0] : 'Instructor');
            userApproved = !!userData.approved;

            // Refresh admin status (claims + DB + super-admin email)
            await refreshAdminStatus();

            if (userApproved) {
                showMainContent();
                loadWeeklyPlans();
                initChat();
                loadAnnouncements();
                loadNotificationPrefs().then(() => {
                    if (typeof Notification !== 'undefined' && Notification.permission === 'granted' && window.notificationPrefs.enabled) {
                        try { registerForPush().catch(e => console.warn('registerForPush failed', e)); } catch (_) {}
                    }
                }).catch(() => {});

                // Show admin panel only if current user is admin
                if (currentUserIsAdmin) {
                    showAdminPanel();
                } else {
                    if (adminPanel) adminPanel.classList.add('hidden');
                }
            } else {
                // User is NOT approved
                showPendingApproval();
                if (adminPanel) adminPanel.classList.add('hidden');
            }
        };

        // Attach realtime listener to user record so approval/admin changes take effect immediately
        userRef.on('value', handleUserSnapshot, (err) => {
            console.error('User record listener error:', err);
            showPendingApproval();
        });
    } catch (err) {
        console.error('Auth state change error:', err);
    }
});

function initNotificationUI() {
    const btn = document.getElementById('enable-notifications-btn');
    if (!btn || typeof Notification === 'undefined') return;

    if (Notification.permission === 'granted') {
        if (window.notificationPrefs.enabled) btn.classList.add('hidden');
        else btn.classList.remove('hidden');
    } else if (Notification.permission === 'denied') {
        btn.textContent = 'Notifications blocked';
        btn.disabled = true;
        btn.classList.remove('hidden');
    } else {
        btn.classList.remove('hidden');
    }
    btn.addEventListener('click', () => {
        Notification.requestPermission().then(p => {
            if (p === 'granted') {
                window.notificationPrefs.enabled = true;
                saveNotificationPrefs();
                applyNotificationPrefsToUI();
                // Register with FCM (if available) to obtain and persist a push token
                try { registerForPush().catch(e => console.warn('registerForPush failed', e)); } catch (_) {}
                showNotification('Notifications enabled', { body: 'Urgent announcements will appear.' });
                btn.classList.add('hidden');
            } else if (p === 'denied') {
                btn.textContent = 'Notifications blocked';
            }
        });
    });
}
window.__urgentNotifiedIds = new Set();
window.notificationPrefs = { enabled:false, urgent:true, weather:true, own:true };
window.notificationPrefsLoaded = false;

function loadNotificationPrefs() {
    const user = auth.currentUser;
    let fromDb = null;
    if (user) {
        // Attempt sync read
        // (Realtime listener not needed; user can click save button to update)
        return db.ref('users/' + user.uid + '/notificationPrefs').once('value').then(snap => {
            fromDb = snap.val();
            const localRaw = localStorage.getItem('notificationPrefs');
            const localPrefs = localRaw ? JSON.parse(localRaw) : {};
            const merged = { ...window.notificationPrefs, ...localPrefs, ...fromDb };
            window.notificationPrefs = merged;
            applyNotificationPrefsToUI();
            window.notificationPrefsLoaded = true;
        }).catch(() => {
            applyNotificationPrefsToUI();
        });
    } else {
        const localRaw = localStorage.getItem('notificationPrefs');
        if (localRaw) {
            window.notificationPrefs = { ...window.notificationPrefs, ...JSON.parse(localRaw) };
        }
        applyNotificationPrefsToUI();
        return Promise.resolve();
    }
}

function saveNotificationPrefs() {
    const user = auth.currentUser;
    localStorage.setItem('notificationPrefs', JSON.stringify(window.notificationPrefs));
    if (user) {
        db.ref('users/' + user.uid + '/notificationPrefs').set({ ...window.notificationPrefs, updated: Date.now() }).catch(e=>console.error('[Notify] Save error', e));
    }
    applyNotificationPrefsToUI();
}

function applyNotificationPrefsToUI() {
    const enabledEl = document.getElementById('pref-enabled');
    const urgentEl = document.getElementById('pref-urgent');
    const weatherEl = document.getElementById('pref-weather');
    const ownEl = document.getElementById('pref-own');
    if (!enabledEl || !urgentEl || !weatherEl || !ownEl) return;
    enabledEl.checked = !!window.notificationPrefs.enabled;
    urgentEl.checked = !!window.notificationPrefs.urgent;
    weatherEl.checked = !!window.notificationPrefs.weather;
    ownEl.checked = !!window.notificationPrefs.own;
}

function initNotificationPreferencesUI() {
    const toggleBtn = document.getElementById('toggle-prefs-btn');
    const panel = document.getElementById('notification-preferences');
    const saveBtn = document.getElementById('save-prefs-btn');
    const disableAllBtn = document.getElementById('disable-all-prefs-btn');
    const enabledEl = document.getElementById('pref-enabled');
    const flashEl = document.getElementById('prefs-flash');
    if (!toggleBtn || !panel) return;
    function flash(msg) {
        if (!flashEl) return;
        flashEl.textContent = msg;
        flashEl.classList.remove('hidden');
        setTimeout(() => { flashEl.classList.add('hidden'); }, 1800);
    }
    toggleBtn.addEventListener('click', () => {
        panel.classList.toggle('hidden');
    });
    saveBtn?.addEventListener('click', () => {
        const urgentEl = document.getElementById('pref-urgent');
        const weatherEl = document.getElementById('pref-weather');
        const ownEl = document.getElementById('pref-own');
        window.notificationPrefs.enabled = !!enabledEl.checked;
        window.notificationPrefs.urgent = !!urgentEl.checked;
        window.notificationPrefs.weather = !!weatherEl.checked;
        window.notificationPrefs.own = !!ownEl.checked;
        if (window.notificationPrefs.enabled && typeof Notification !== 'undefined' && Notification.permission === 'default') {
            Notification.requestPermission().then(p => {
                if (p !== 'granted') { window.notificationPrefs.enabled = false; applyNotificationPrefsToUI(); flash('Permission denied'); }
                saveNotificationPrefs();
                flash('Preferences saved');
            });
        } else {
            saveNotificationPrefs();
            flash('Preferences saved');
        }
    });
    disableAllBtn?.addEventListener('click', () => {
        window.notificationPrefs.enabled = false;
        window.notificationPrefs.urgent = false;
        window.notificationPrefs.weather = false;
        window.notificationPrefs.own = false;
        saveNotificationPrefs();
        applyNotificationPrefsToUI();
        flash('All notifications disabled');
        const enableBtn = document.getElementById('enable-notifications-btn');
        if (enableBtn && Notification.permission === 'granted') enableBtn.classList.remove('hidden');
    });
}

// Chat initialization guard to prevent multiple listeners
let chatInitialized = false;
let chatMessagesRef = null;

// Apps Script webhook URL (deployed web app). Update if you deploy a new version.
const GOOGLE_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbxFWId3k2ySboWqDSuRkH-q7dOsUrS1AsUpXnYqHTRjGMk1503tIrGzQ0xgMczFKbQq/exec';

// Send admin notification by POSTing form-encoded data to the Apps Script
// web app. We use `application/x-www-form-urlencoded` so browsers avoid a
// CORS preflight. The Apps Script accepts JSON or form-encoded payloads.
async function sendAdminNotification(type, payload) {
    if (!GOOGLE_SCRIPT_URL) {
        console.warn('[AdminNotify] no script URL configured');
        return false;
    }

    const bodyObj = { type, payload: payload || {} };
    const params = new URLSearchParams();
    params.append('type', type);
    try {
        params.append('payload', JSON.stringify(payload || {}));
    } catch (_) {
        params.append('payload', String(payload || ''));
    }

    try {
        const res = await fetch(GOOGLE_SCRIPT_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: params.toString()
        });

        // Some browsers will block reading the response body cross-origin
        // when the remote app doesn't set CORS headers. If the fetch resolves
        // with no exception we've at least delivered the request.
        if (res && (res.ok || res.type === 'opaque' || res.type === 'basic')) return true;
        return false;
    } catch (err) {
        console.warn('[AdminNotify] webhook error', err);
        return false;
    }
}

// --- OFFLINE MODE & SERVICE WORKER ---
let isOnline = navigator.onLine;
let offlineCache = {};

// Register service worker for offline support
if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('/sw.js').catch(err => console.error('SW registration failed:', err));
}

// Monitor online/offline status
window.addEventListener('online', () => {
    isOnline = true;
    document.getElementById('offline-indicator')?.classList.add('hidden');
});

window.addEventListener('offline', () => {
    isOnline = false;
    document.getElementById('offline-indicator')?.classList.remove('hidden');
});

// Push notification & FCM logic removed
const authContainer = document.getElementById('auth-container');
const mainContent = document.getElementById('main-content');
const pendingApproval = document.getElementById('pending-approval');
const loginForm = document.getElementById('login-form');
const emailInput = document.getElementById('email-input');
const passwordInput = document.getElementById('password-input');
const authError = document.getElementById('auth-error');
const logoutBtn = document.getElementById('logout-btn');
const pendingLogoutBtn = document.getElementById('pending-logout-btn');
const adminPanel = document.getElementById('admin-panel');
// Auth mode toggle elements
const nameWrapper = document.getElementById('signup-name-wrapper');
const authHeading = document.getElementById('auth-heading');
const toggleAuthModeBtn = document.getElementById('toggle-auth-mode');
const authSubmitBtn = document.getElementById('auth-submit-btn');
let authMode = 'login'; // 'login' or 'signup'

function setAuthMode(mode) {
    authMode = mode;
    if (mode === 'signup') {
        if (nameWrapper) nameWrapper.classList.remove('hidden');
        if (authHeading) authHeading.textContent = 'Create Account';
        if (authSubmitBtn) authSubmitBtn.textContent = 'Create Account';
        if (toggleAuthModeBtn) toggleAuthModeBtn.textContent = 'Already have an account? Sign in';
    } else {
        if (nameWrapper) nameWrapper.classList.add('hidden');
        if (authHeading) authHeading.textContent = 'Instructor Login';
        if (authSubmitBtn) authSubmitBtn.textContent = 'Sign In';
        if (toggleAuthModeBtn) toggleAuthModeBtn.textContent = 'Need an account? Sign up';
    }
    if (authError) { authError.textContent = ''; authError.classList.add('hidden'); }
    // Update Google button label to reflect signup vs signin
    try {
        const gbtn = document.getElementById('google-signin-btn');
        if (gbtn) {
            const span = gbtn.querySelector('span');
            if (span) span.textContent = (mode === 'signup') ? 'Sign up with Google' : 'Sign in with Google';
        }
    } catch (_) {}
}

// Update Google button label when auth mode changes
try {
    const _origSetAuthMode = setAuthMode;
} catch (_) {}

if (toggleAuthModeBtn) {
    toggleAuthModeBtn.addEventListener('click', (e) => {
        e.preventDefault();
        setAuthMode(authMode === 'login' ? 'signup' : 'login');
        if (authMode === 'signup') {
            const nameInput = document.getElementById('name-input');
            if (nameInput) nameInput.focus();
        } else if (emailInput) {
            emailInput.focus();
        }
    });
}

// Ensure initial state
setAuthMode('login');

// Admin Email
const ADMIN_EMAIL = "jamescassidylk@gmail.com";
let currentUserName = null;
let currentUserIsAdmin = false;
let currentUserCanGrant = false;
// Realtime listener state flags
let userApproved = false;
let announcementsListenerAttached = false;
let notificationsListenerAttached = false;
let userRecordListener = null;

async function refreshAdminStatus() {
    const user = auth.currentUser;
    if (!user) {
        currentUserIsAdmin = false;
        currentUserCanGrant = false;
        return false;
    }

    const emailIsSuper = user.email && user.email.toLowerCase() === ADMIN_EMAIL.toLowerCase();
    let dbFlags = { isAdmin: false, canGrantAdmin: false };
    try {
        const snap = await db.ref('users/' + user.uid).once('value');
        const val = snap.val() || {};
        dbFlags.isAdmin = !!val.isAdmin;
        dbFlags.canGrantAdmin = !!val.canGrantAdmin;
    } catch (e) {
        console.warn('refreshAdminStatus: db read failed', e);
    }

    let claimAdmin = false;
    let claimGrant = false;
    try {
        const idToken = await user.getIdTokenResult(true); // force refresh to pick up claim changes
        claimAdmin = !!(idToken.claims && idToken.claims.admin);
        claimGrant = !!(idToken.claims && idToken.claims.canGrantAdmin);
    } catch (e) {
        console.warn('refreshAdminStatus: token read failed', e);
    }

    currentUserIsAdmin = emailIsSuper || claimAdmin || dbFlags.isAdmin;
    currentUserCanGrant = emailIsSuper || claimGrant || dbFlags.canGrantAdmin;
    return currentUserIsAdmin;
}

// --- LOGIN FALLBACK & DEFENSIVE REBIND ---
function ensureLoginInteractivity() {
    try {
        const loginFormEl = document.getElementById('login-form');
        if (!loginFormEl) return;
        const emailEl = document.getElementById('email-input');
        const passwordEl = document.getElementById('password-input');
        if (emailEl) { emailEl.removeAttribute('disabled'); emailEl.style.pointerEvents = 'auto'; }
        if (passwordEl) { passwordEl.removeAttribute('disabled'); passwordEl.style.pointerEvents = 'auto'; }
        // Rebind submit if no listener flag present
        if (!loginFormEl.__listenerBound) {
            loginFormEl.addEventListener('submit', (e) => {
                e.preventDefault();
                const email = emailEl.value.trim();
                const password = passwordEl.value.trim();
                if (!email || !password) {
                    authError.textContent = 'Please enter email and password.';
                    authError.classList.remove('hidden');
                    return;
                }
                if (authMode === 'login') {
                    auth.signInWithEmailAndPassword(email, password).catch(error => {
                        authError.textContent = error.message;
                        authError.classList.remove('hidden');
                    });
                } else {
                    const nameInput = document.getElementById('name-input');
                    const displayName = nameInput ? nameInput.value.trim() : '';
                    if (!displayName) {
                        authError.textContent = 'Please enter your name to create an account.';
                        authError.classList.remove('hidden');
                        return;
                    }
                    console.log('[DEBUG][signup][ensureLoginInteractivity] createUserWithEmailAndPassword called', { email, ts: Date.now() });
                    if (window.__signupInFlight) {
                        console.warn('[DEBUG][signup] signup already in progress, skipping duplicate call', { email, ts: Date.now() });
                        authError.textContent = 'Signup already in progress. Please wait.';
                        authError.classList.remove('hidden');
                        return;
                    }
                    window.__signupInFlight = true;
                    firebase.auth().createUserWithEmailAndPassword(email, password)
                        .then(userCredential => {
                            const uid = userCredential.user.uid;
                            // Mark recent signup to avoid auth.onAuthStateChanged duplicate write
                            try { sessionStorage.setItem('__recentSignupUid', uid); } catch (_) {}
                            console.log('[DEBUG][signup] createUser resolved', { uid: userCredential.user.uid, email: userCredential.user.email, ts: Date.now() });
                            return db.ref('users/' + uid).set({
                                email: user.email,
                                name: displayName,
                                approved: false,
                                role: 'instructor'
                            }).then(() => {
                                console.log('[DEBUG][signup] users/<uid> set (ensureLoginInteractivity)', { uid, ts: Date.now() });
                            });
                        })
                        .then(() => {
                            alert('Account created. Awaiting approval.');
                            showPendingApproval();
                        })
                        .catch(error => {
                            console.error('[DEBUG][signup] error:', error);
                            authError.textContent = error.message;
                            authError.classList.remove('hidden');
                        })
                        .finally(() => { window.__signupInFlight = false; });
                }
            });
            loginFormEl.__listenerBound = true;
        }
        if (emailEl && !emailEl.value) emailEl.focus();
    } catch (err) { console.error('[Auth] ensureLoginInteractivity error', err); }
}

document.addEventListener('DOMContentLoaded', () => {
    // If not authenticated show login & enforce interactivity
    if (!auth.currentUser) {
        showLogin();
        ensureLoginInteractivity();
    }
});

auth.onAuthStateChanged(user => {
    if (user) {

        // Check approval status in Database
        db.ref('users/' + user.uid).once('value').then(snapshot => {
            const userData = snapshot.val();

            // If user data doesn't exist (legacy users or direct firebase console creations), assume approved or handle gracefully
            // For this implementation, we'll enforce the check: if no record, create one as unapproved.
            if (!userData) {
                // If we just created this user via the signup flow, skip creating again here.
                let recentUid = null;
                try { recentUid = sessionStorage.getItem('__recentSignupUid'); } catch (_) { recentUid = null; }
                if (recentUid && recentUid === user.uid) {
                    console.log('[DEBUG][auth.onAuthStateChanged] recent signup detected, skipping duplicate DB write', { uid: user.uid, ts: Date.now() });
                    showPendingApproval();
                } else {
                    // Create default entry (instrumented for duplicate-signup debugging)
                    console.log('[DEBUG][auth.onAuthStateChanged] creating default user record', { uid: user.uid, email: user.email, ts: Date.now() });
                    db.ref('users/' + user.uid).set({
                        email: user.email,
                        approved: false,
                        role: 'instructor'
                    }).then(() => {
                        console.log('[DEBUG][auth.onAuthStateChanged] users/<uid> set', { uid: user.uid, ts: Date.now() });
                        showPendingApproval();
                    }).catch(err => {
                        console.error('[DEBUG][auth.onAuthStateChanged] error setting users/<uid>:', err);
                    });
                }
            } else if (userData.approved) {
                // User is approved
                currentUserName = userData.name || (user.email ? user.email.split('@')[0] : 'Instructor');
                showMainContent();
                loadWeeklyPlans();
                initChat();

                userApproved = true;
                // Attach announcements listener and load notification preferences
                loadAnnouncements();
                loadNotificationPrefs().then(() => {
                    if (typeof Notification !== 'undefined' && Notification.permission === 'granted' && window.notificationPrefs.enabled) {
                        try { registerForPush().catch(e => console.warn('registerForPush failed', e)); } catch (_) {}
                    }
                }).catch(() => {});

                // Check if Admin via ID token claim (preferred) or fallback to email match
                try {
                    user.getIdTokenResult().then(idToken => {
                        if (idToken && idToken.claims && idToken.claims.admin) {
                            // Ensure admin sees main content and admin panel even if DB approved flag is missing
                            currentUserName = userData && userData.name ? userData.name : (user.email ? user.email.split('@')[0] : 'Admin');
                            showMainContent();
                            showAdminPanel();
                            userApproved = true;
                        } else if (user.email === ADMIN_EMAIL) {
                            showAdminPanel();
                        }
                    }).catch(err => {
                        console.error('[Auth] getIdTokenResult error while checking admin claim:', err);
                        if (user.email === ADMIN_EMAIL) showAdminPanel();
                    });
                } catch (err) {
                    console.error('[Auth] error checking admin claim:', err);
                    if (user.email === ADMIN_EMAIL) showAdminPanel();
                }
            } else {
                // User is NOT approved
                currentUserName = userData.name || (user.email ? user.email.split('@')[0] : 'Pending');
                showPendingApproval();
                userApproved = false;
                // Still attach announcements so user can see board (read-only behavior handled by UI/roles)
                loadAnnouncements();
                loadNotificationPrefs();
            }
        }).catch(err => {
            console.error("Error fetching user data:", err);
            // Fallback: show pending if error
            showPendingApproval();
        });

    } else {
        // No user is signed in.
        showLogin();
        userApproved = false;
        // Detach listeners if previously attached
        if (announcementsListenerAttached) {
            db.ref('announcements').off();
            announcementsListenerAttached = false;
        }
        // Notifications listener removed
        if (notificationsListenerAttached) {
            messaging.onMessage(null);
            notificationsListenerAttached = false;
        }
    }
});

function showMainContent() {
    if (authContainer) authContainer.classList.add('hidden');
    if (pendingApproval) pendingApproval.classList.add('hidden');
    if (mainContent) mainContent.classList.remove('hidden');
    if (logoutBtn) logoutBtn.classList.remove('hidden');
    if (adminPanel) adminPanel.classList.add('hidden'); // Hide admin panel if not admin
    // Apply saved arrangement once content is visible
    try { if (typeof applySavedArrangement === 'function') applySavedArrangement(); } catch (_) { }
}

function showPendingApproval() {
    if (authContainer) authContainer.classList.add('hidden');
    if (mainContent) mainContent.classList.add('hidden');
    if (pendingApproval) pendingApproval.classList.remove('hidden');
    if (logoutBtn) logoutBtn.classList.add('hidden'); // Hide main logout, use pending logout
    if (adminPanel) adminPanel.classList.add('hidden');
}

function showLogin() {
    if (authContainer) authContainer.classList.remove('hidden');
    if (mainContent) mainContent.classList.add('hidden');
    if (pendingApproval) pendingApproval.classList.add('hidden');
    if (logoutBtn) logoutBtn.classList.add('hidden');
    if (adminPanel) adminPanel.classList.add('hidden');
}

function showAdminPanel() {
    if (!adminPanel) return;
    refreshAdminStatus().then(isAdmin => {
        if (!isAdmin) {
            adminPanel.classList.add('hidden');
            return;
        }
        adminPanel.classList.remove('hidden');
        loadPendingUsers();
    });
}

function loadPendingUsers() {
    const list = document.getElementById('pending-users-list');
    if (!list) return;
    list.innerHTML = '<tr><td colspan="3" class="px-4 py-2 text-center">Loading...</td></tr>';
    const current = auth.currentUser;
    if (!current) {
        list.innerHTML = '<tr><td colspan="3" class="px-4 py-2 text-center text-gray-500">Admin only</td></tr>';
        return;
    }

    refreshAdminStatus().then(isAdmin => {
        if (!isAdmin) {
            list.innerHTML = '<tr><td colspan="3" class="px-4 py-2 text-center text-gray-500">Admin only</td></tr>';
            return;
        }

        db.ref('users').once('value').then(snapshot => {
            list.innerHTML = '';
            const users = snapshot.val();
            if (users) {
                Object.keys(users).forEach(uid => {
                    const u = users[uid];
                    // Do not display admin user to prevent accidental revoke/delete
                    if (u.email === ADMIN_EMAIL) return;
                    // Do not show the currently signed-in admin in the table
                    if (uid === current.uid) return;
                    const approved = !!u.approved;
                    // Treat older records with canGrantAdmin/admin flag as admin for UI purposes
                    const isAdminRow = !!(u.isAdmin || u.canGrantAdmin || u.admin === true);
                    const tr = document.createElement('tr');
                    tr.className = "border-t";
                    const statusClasses = approved ? 'text-green-600 font-semibold' : 'text-yellow-600 font-semibold';
                    let actionCell = '';
                    if (!approved) {
                        actionCell += `<button onclick=\"approveUser('${uid}')\" class=\"bg-green-500 text-white px-3 py-1 rounded hover:bg-green-600 text-sm mr-2\">Approve</button>`;
                    } else {
                        actionCell += `<button onclick=\"revokeUser('${uid}')\" class=\"bg-yellow-500 text-white px-3 py-1 rounded hover:bg-yellow-600 text-sm mr-2\">Revoke</button>`;
                    }
                    if (!isAdminRow) {
                        actionCell += `<button onclick=\"makeAdmin('${uid}')\" class=\"bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600 text-sm mr-2\">Make Admin</button>`;
                    } else {
                        actionCell += `<button onclick=\"revokeAdmin('${uid}')\" class=\"bg-orange-500 text-white px-3 py-1 rounded hover:bg-orange-600 text-sm mr-2\">Revoke Admin</button>`;
                    }
                    actionCell += `<button onclick=\"deleteUserRecord('${uid}')\" class=\"bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600 text-sm\">Delete</button>`;
                    tr.innerHTML = `
                        <td class="px-4 py-2">${u.email}</td>
                        <td class="px-4 py-2 ${statusClasses}">${approved ? 'Approved' : 'Pending'}</td>
                        <td class="px-4 py-2">${actionCell}</td>
                    `;
                    list.appendChild(tr);
                });
            } else {
                list.innerHTML = '<tr><td colspan="3" class="px-4 py-2 text-center text-gray-500">No users found.</td></tr>';
            }
        }).catch(err => {
            console.error('Error loading users:', err);
            list.innerHTML = '<tr><td colspan="3" class="px-4 py-2 text-center text-red-500">Error loading users.</td></tr>';
        });
    }).catch(err => {
        console.error('Error checking admin access:', err);
        list.innerHTML = '<tr><td colspan="3" class="px-4 py-2 text-center text-red-500">Error verifying admin access.</td></tr>';
    });
}

// Global function for onclick
window.approveUser = function (uid) {
    // Check token claims first to avoid permission_denied from server rules
    const current = auth.currentUser;
    if (!current) return alert('You must be signed in as an admin to approve users.');
    refreshAdminStatus().then(isAdmin => {
        if (!isAdmin) {
            return alert('Your account does not have admin access.');
        }
        if (!confirm('Are you sure you want to approve this user?')) return;
        db.ref('users/' + uid).once('value').then(snapshot => {
            const userData = snapshot.val();
            return db.ref('users/' + uid).update({ approved: true }).then(() => {
                    if (typeof GOOGLE_SCRIPT_URL !== 'undefined' && GOOGLE_SCRIPT_URL && GOOGLE_SCRIPT_URL !== 'YOUR_GOOGLE_APPS_SCRIPT_WEB_APP_URL_HERE' && userData && userData.email) {
                        sendAdminNotification('approval_notification', {
                            email: userData.email,
                            userName: userData.name || userData.email.split('@')[0],
                            instructorsUrl: 'https://rathmullan-sailing-notes.pages.dev/',
                            // Send admin's display name (avoid exposing UID)
                            createdByName: current ? (current.displayName || (current.email ? current.email.split('@')[0] : 'Admin')) : null,
                            action: 'approved'
                        }).catch(e => console.error('sendAdminNotification error', e));
                    }
                alert('User approved! Notification email sent.');
                loadPendingUsers();
            });
        }).catch(err => {
            alert('Error approving user: ' + err.message);
        });
    });
};

// Revoke user access (sets approved to false)
window.revokeUser = function (uid) {
    const current = auth.currentUser;
    if (!current) return alert('You must be signed in as an admin to revoke users.');
    refreshAdminStatus().then(isAdmin => {
        if (!isAdmin) {
            return alert('Your account does not have admin access.');
        }
        if (!confirm('Revoke this user\'s access? They will see Pending until re-approved.')) return;
        // Read user record so we can email the affected user after revocation
        db.ref('users/' + uid).once('value').then(snapshot => {
            const userData = snapshot.val() || {};
            return db.ref('users/' + uid).update({ approved: false }).then(() => {
                    if (typeof GOOGLE_SCRIPT_URL !== 'undefined' && GOOGLE_SCRIPT_URL && GOOGLE_SCRIPT_URL !== 'YOUR_GOOGLE_APPS_SCRIPT_WEB_APP_URL_HERE' && userData && userData.email) {
                    sendAdminNotification('approval_notification', {
                        email: userData.email,
                        userName: userData.name || userData.email.split('@')[0],
                        createdByName: current ? (current.displayName || (current.email ? current.email.split('@')[0] : 'Admin')) : null,
                        action: 'revoked'
                    }).catch(e => console.error('sendAdminNotification error', e));
                }
                alert('User access revoked.');
                loadPendingUsers();
            });
        }).catch(err => alert('Error revoking user: ' + err.message));
    });
};

// Delete user record from Realtime Database (cannot delete Auth user here)
window.deleteUserRecord = function (uid) {
    const current = auth.currentUser;
    if (!current) return alert('You must be signed in as an admin to delete user records.');
    refreshAdminStatus().then(isAdmin => {
        if (!isAdmin) {
            return alert('Your account does not have admin access.');
        }
        if (!confirm('Delete this user\'s database record? If they sign in again they will be recreated as Pending.')) return;
        db.ref('users/' + uid).remove().then(() => {
            alert('User record deleted. They can still authenticate unless removed via Firebase Console.');
            loadPendingUsers();
        }).catch(err => alert('Error deleting user record: ' + err.message));
    });
};

// Make user admin (sets database flag and shows instructions for custom claim)
window.makeAdmin = function (uid) {
    const current = auth.currentUser;
    if (!current) return alert('You must be signed in as an admin.');
    refreshAdminStatus().then(isAdmin => {
        if (!isAdmin) {
            return alert('Your account does not have admin access.');
        }

        // Create a custom modal for admin permissions
        const modalHTML = `
            <div id="admin-modal" style="position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.7); z-index: 9999; display: flex; align-items: center; justify-content: center;">
                <div style="background: white; padding: 24px; border-radius: 8px; max-width: 500px; width: 90%;">
                    <h3 style="margin: 0 0 16px 0; font-size: 18px; font-weight: 600;">Make User Admin</h3>
                    <p style="margin-bottom: 16px; color: #4b5563;">Grant admin privileges to this user.</p>
                    <label style="display: flex; align-items: center; margin-bottom: 16px; cursor: pointer;">
                        <input type="checkbox" id="can-grant-admin-checkbox" style="margin-right: 8px; width: 18px; height: 18px; cursor: pointer;">
                        <span style="font-size: 14px;">Allow this admin to grant admin privileges to others</span>
                    </label>
                    <p style="font-size: 12px; color: #6b7280; margin-bottom: 20px;">Note: Custom claims must still be set server-side via Firebase Admin SDK.</p>
                    <div style="display: flex; gap: 8px; justify-content: flex-end;">
                        <button id="admin-modal-cancel" style="padding: 8px 16px; border: 1px solid #d1d5db; border-radius: 4px; background: white; cursor: pointer;">Cancel</button>
                        <button id="admin-modal-confirm" style="padding: 8px 16px; border: none; border-radius: 4px; background: #3b82f6; color: white; cursor: pointer;">Confirm</button>
                    </div>
                </div>
            </div>
        `;

        document.body.insertAdjacentHTML('beforeend', modalHTML);
        const modal = document.getElementById('admin-modal');
        const checkbox = document.getElementById('can-grant-admin-checkbox');
        const cancelBtn = document.getElementById('admin-modal-cancel');
        const confirmBtn = document.getElementById('admin-modal-confirm');

        cancelBtn.onclick = () => modal.remove();
        confirmBtn.onclick = async () => {
            const canGrantAdmin = checkbox.checked;
            confirmBtn.disabled = true;
            confirmBtn.textContent = 'Processing...';

            try {
                // Ensure caller is allowed to grant
                await refreshAdminStatus();
                if (!currentUserCanGrant) {
                    throw new Error('You are not allowed to grant admin rights.');
                }
                // Get the current user's ID token (force refresh to include latest claims)
                const token = await current.getIdToken(true);

                // Call Cloudflare Pages Function
                const response = await fetch('/admin-claims', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        action: 'grant',
                        targetUid: uid,
                        canGrantAdmin: canGrantAdmin,
                        adminToken: token
                    })
                });

                const result = await response.json();
                modal.remove();

                if (response.ok) {
                    // Mirror the server update in Realtime DB so the UI updates immediately
                    try {
                        await db.ref('users/' + uid).update({ isAdmin: true, canGrantAdmin: canGrantAdmin === true });
                    } catch (e) {
                        console.warn('Local DB admin flag update failed (continuing):', e);
                    }
                    alert('Admin privileges granted successfully!\n\nThe user now has full admin access. They may need to sign out and back in for changes to take effect.');
                    loadPendingUsers();
                } else {
                    alert('Failed to grant admin privileges: ' + (result.error || 'Unknown error') + (result.caller ? `\n\nCaller flags: ${JSON.stringify(result.caller.sources || result.caller)}` : ''));
                }
            } catch (err) {
                modal.remove();
                console.error('Error granting admin:', err);
                alert('Failed to grant admin privileges: ' + err.message);
            }
        };
    });
};

// Revoke admin privileges
window.revokeAdmin = function (uid) {
    const current = auth.currentUser;
    if (!current) return alert('You must be signed in as an admin.');
    refreshAdminStatus().then(async isAdmin => {
        if (!isAdmin) {
            return alert('Your account does not have admin access.');
        }
        if (!currentUserCanGrant) {
            return alert('You do not have permission to revoke admin privileges. Only admins with "make admin" privilege can revoke admins.');
        }
        if (!confirm('Revoke admin privileges for this user? This will remove both database flags and custom claims.')) return;

        try {
            // Get the current user's ID token (force refresh to include latest claims)
            const token = await current.getIdToken(true);

            // Call Cloudflare Pages Function
            const response = await fetch('/admin-claims', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    action: 'revoke',
                    targetUid: uid,
                    adminToken: token
                })
            });

            const result = await response.json();

            if (response.ok) {
                // Mirror server update for immediate UI feedback
                try {
                    await db.ref('users/' + uid).update({ isAdmin: false, canGrantAdmin: false });
                } catch (e) {
                    console.warn('Local DB admin revoke update failed (continuing):', e);
                }
                alert('Admin privileges revoked successfully!\n\nThe user no longer has admin access. They may need to sign out and back in for changes to take effect.');
                loadPendingUsers();
            } else {
                alert('Failed to revoke admin privileges: ' + (result.error || 'Unknown error') + (result.caller ? `\n\nCaller flags: ${JSON.stringify(result.caller.sources || result.caller)}` : ''));
            }
        } catch (err) {
            console.error('Error revoking admin:', err);
            alert('Failed to revoke admin privileges: ' + err.message);
        }
    });
};

if (loginForm) {
    loginForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const email = emailInput.value.trim();
        const password = passwordInput.value.trim();
        if (!email || !password) {
            authError.textContent = 'Please enter email and password.';
            authError.classList.remove('hidden');
            return;
        }
        if (authMode === 'login') {
            auth.signInWithEmailAndPassword(email, password).catch(error => {
                authError.textContent = error.message;
                authError.classList.remove('hidden');
            });
        } else { // signup
            const nameInput = document.getElementById('name-input');
            const displayName = nameInput ? nameInput.value.trim() : '';
            if (!displayName) {
                authError.textContent = 'Please enter your name to create an account.';
                authError.classList.remove('hidden');
                return;
            }
            console.log('[DEBUG][signup][loginForm] createUserWithEmailAndPassword called', { email, ts: Date.now() });
            if (window.__signupInFlight) {
                console.warn('[DEBUG][signup] signup already in progress (loginForm), skipping duplicate call', { email, ts: Date.now() });
                authError.textContent = 'Signup already in progress. Please wait.';
                authError.classList.remove('hidden');
                return;
            }
            window.__signupInFlight = true;
            firebase.auth().createUserWithEmailAndPassword(email, password)
                .then(userCredential => {
                    const user = userCredential.user;
                    try { sessionStorage.setItem('__recentSignupUid', user.uid); } catch (_) {}
                    console.log('[DEBUG][signup] createUser resolved (loginForm)', { uid: user.uid, email: user.email, ts: Date.now() });
                    return db.ref('users/' + user.uid).set({
                        email: user.email,
                        name: displayName,
                        approved: false,
                        role: 'instructor'
                    }).then(() => {
                        console.log('[DEBUG][signup] users/<uid> set (loginForm)', { uid: user.uid, ts: Date.now() });
                        if (typeof GOOGLE_SCRIPT_URL !== 'undefined' && GOOGLE_SCRIPT_URL && GOOGLE_SCRIPT_URL !== 'YOUR_GOOGLE_APPS_SCRIPT_WEB_APP_URL_HERE') {
                            sendAdminNotification('signup_notification', {
                                email: user.email,
                                adminEmail: ADMIN_EMAIL,
                                instructorsUrl: 'https://rathmullan-sailing-notes.pages.dev/',
                                createdBy: user.uid
                            }).catch(() => { });
                        }
                    });
                })
                .catch(error => {
                    console.error('[DEBUG][signup] error (loginForm):', error);
                    authError.textContent = error.message;
                    authError.classList.remove('hidden');
                })
                .finally(() => { window.__signupInFlight = false; });
        }
    });
}

if (logoutBtn) {
    logoutBtn.addEventListener('click', () => {
        auth.signOut().then(() => {
            showLogin();
        }).catch(err => {
            console.error('Logout error:', err);
            showLogin();
        });
    });
}

if (pendingLogoutBtn) {
    pendingLogoutBtn.addEventListener('click', () => {
        auth.signOut().then(() => {
            showLogin();
        }).catch(err => {
            console.error('Logout error:', err);
            showLogin();
        });
    });
}

// Google Sign-In handler
const googleSignInBtn = document.getElementById('google-signin-btn');
if (googleSignInBtn) {
    googleSignInBtn.addEventListener('click', (e) => {
        e.preventDefault();
        if (!window.firebase || !firebase.auth) {
            alert('Auth library not loaded yet. Try again in a moment.');
            return;
        }
        if (window.__signupInFlight) {
            console.warn('Google sign-in already in progress');
            return;
        }
        window.__signupInFlight = true;
        const provider = new firebase.auth.GoogleAuthProvider();
        firebase.auth().signInWithPopup(provider)
            .then(result => {
                // Mark as recent signup so auth listener creates database record
                try { sessionStorage.setItem('__recentSignupUid', result.user.uid); } catch (_) {}
                window.__signupInFlight = false;
            })
            .catch(err => {
                window.__signupInFlight = false;
                // Only show alert if user didn't just cancel
                if (err.code !== 'auth/popup-closed-by-user' && err.code !== 'auth/cancelled-popup-request') {
                    console.error('Google sign-in error:', err);
                    alert('Google sign-in failed: ' + (err.message || 'Unknown error'));
                }
            });
    });
}

// --- Weekly Planning Logic ---
const weeklyLevels = [
    "taste-of-sailing",
    "start-sailing",
    "basic-skills",
    "improving-skills"
];
const days = ["mon", "tue", "wed", "thu", "fri"];
const slots = ["am", "pm"];

function weeklyPlanKey(level, day, slot) {
    return `weeklyPlan/${level}/${day}/${slot}`;
}

function addActivity(level, day, slot, activity) {
    const ref = db.ref(weeklyPlanKey(level, day, slot));
    ref.once('value').then(snap => {
        let arr = snap.val() || [];
        arr.push({ id: uuidv4(), text: activity });
        ref.set(arr).then(() => {
            updateWeeklySlot(level, day, slot, arr);
        });
    });
}

function updateWeeklySlot(level, day, slot, activities) {
    const cell = document.querySelector(`.weekly-slot[data-level="${level}"][data-day="${day}"][data-slot="${slot}"]`);
    if (!cell) return;
    cell.innerHTML = '';
    activities.forEach(act => {
        const div = document.createElement('div');
        div.className = "weekly-activity bg-blue-100 rounded px-2 py-1 mb-1 shadow cursor-pointer";
        div.textContent = act.text;
        div.title = "Click to edit/delete. Drag to move.";
        div.setAttribute('data-id', act.id);
        div.setAttribute('draggable', 'true');
        div.oncontextmenu = function (e) {
            e.preventDefault();
            removeActivity(level, day, slot, act.id);
        };
        cell.appendChild(div);
    });
}

function removeActivity(level, day, slot, actId) {
    const ref = db.ref(weeklyPlanKey(level, day, slot));
    ref.once('value').then(snap => {
        let arr = snap.val() || [];
        arr = arr.filter(act => act.id !== actId);
        ref.set(arr).then(() => {
            updateWeeklySlot(level, day, slot, arr);
        });
    });
}

function editActivity(level, day, slot, actId, newText) {
    const ref = db.ref(weeklyPlanKey(level, day, slot));
    ref.once('value').then(snap => {
        let arr = snap.val() || [];
        const idx = arr.findIndex(act => act.id === actId);
        if (idx === -1) return;
        arr[idx].text = newText;
        ref.set(arr).then(() => {
            updateWeeklySlot(level, day, slot, arr);
        });
    });
}

function moveWeeklyActivity(fromLevel, fromDay, fromSlot, toLevel, toDay, toSlot, actId) {
    const fromRef = db.ref(weeklyPlanKey(fromLevel, fromDay, fromSlot));
    const toRef = db.ref(weeklyPlanKey(toLevel, toDay, toSlot));
    fromRef.once('value').then(snap => {
        let fromArr = snap.val() || [];
        const idx = fromArr.findIndex(act => act.id === actId);
        if (idx === -1) return;
        const act = fromArr[idx];
        fromArr.splice(idx, 1);
        fromRef.set(fromArr).then(() => {
            toRef.once('value').then(snap2 => {
                let toArr = snap2.val() || [];
                toArr.push(act);
                toRef.set(toArr).then(() => {
                    updateWeeklySlot(fromLevel, fromDay, fromSlot, fromArr);
                    updateWeeklySlot(toLevel, toDay, toSlot, toArr);
                });
            });
        });
    });
}

function loadWeeklyPlans() {
    weeklyLevels.forEach(level => {
        days.forEach(day => {
            slots.forEach(slot => {
                const ref = db.ref(weeklyPlanKey(level, day, slot));
                ref.once('value').then(snap => {
                    updateWeeklySlot(level, day, slot, snap.val() || []);
                });
            });
        });
    });
}

// --- Map Draggables Logic ---
// Expose functions globally for inline scripts
window.saveDraggablePositionToFirebase = function (id, left, top) {
    if (window.db) {
        window.db.ref('mapPositions/' + id).set({ left, top }).then(() => {

        }).catch(err => {
            console.error('❌ Failed to save position for:', id, err);
        });
    }
}
;

window.loadDraggablePositionsFromFirebase = function (callback) {
    if (window.db) {
        window.db.ref('mapPositions').once('value').then(snapshot => {
            const positions = snapshot.val() || {};

            callback(positions);
        }).catch(err => {
            console.error('❌ Failed to load positions:', err);
            callback({});
        });
    } else {
        callback({});
    }
};

// Wait for DOM to be ready before setting up map draggables
document.addEventListener('DOMContentLoaded', () => {
    const map = document.querySelector('#interactive-map .relative');
    const mapDraggables = Array.from(document.querySelectorAll('#interactive-map .draggable'));

    if (map && mapDraggables.length > 0) {

        // Restore positions from Firebase
        window.addEventListener('load', () => {

            // Wait for map to have dimensions before restoring
            const restorePositions = () => {


                if (map.offsetWidth === 0 || map.offsetHeight === 0) {

                    setTimeout(restorePositions, 100);
                    return;
                }

                window.loadDraggablePositionsFromFirebase(positions => {
                    mapDraggables.forEach(item => {
                        const pos = positions[item.id];
                        if (pos && pos.left !== undefined && pos.top !== undefined) {
                            item.style.position = 'absolute';
                            item.style.left = (pos.left * map.offsetWidth) + 'px';
                            item.style.top = (pos.top * map.offsetHeight) + 'px';
                        }
                    });
                });
            };

            restorePositions();
        });

        // Re-calculate positions on window resize for responsive behavior
        let resizeTimer;
        window.addEventListener('resize', () => {
            clearTimeout(resizeTimer);
            resizeTimer = setTimeout(() => {
                window.loadDraggablePositionsFromFirebase(positions => {
                    mapDraggables.forEach(item => {
                        const pos = positions[item.id];
                        if (pos && pos.left !== undefined && pos.top !== undefined) {
                            item.style.left = (pos.left * map.offsetWidth) + 'px';
                            item.style.top = (pos.top * map.offsetHeight) + 'px';
                        }
                    });
                });
            }, 250);
        });

        // Drag Events (Desktop)
        mapDraggables.forEach(item => {
            item.addEventListener('dragstart', (e) => {
                e.dataTransfer.setData('text/plain', e.target.id);
            });
        });

        map.addEventListener('dragover', (e) => {
            e.preventDefault();
        });

        map.addEventListener('drop', (e) => {
            e.preventDefault();
            const id = e.dataTransfer.getData('text/plain');
            const draggable = document.getElementById(id);
            if (!draggable) return;

            const rect = map.getBoundingClientRect();
            const leftPx = e.clientX - rect.left;
            const topPx = e.clientY - rect.top;

            const leftPercent = leftPx / map.offsetWidth;
            const topPercent = topPx / map.offsetHeight;

            draggable.style.position = 'absolute';
            draggable.style.left = leftPx + 'px';
            draggable.style.top = topPx + 'px';


            window.saveDraggablePositionToFirebase(id, leftPercent, topPercent);
        });
    }
});

// --- Section Navigation UX (Quick Nav + Scrollspy + Back-to-top) ---
document.addEventListener('DOMContentLoaded', () => {
    const nav = document.getElementById('section-nav');
    const backToTop = document.getElementById('back-to-top');
    if (!nav) return;

    const linkEls = Array.from(nav.querySelectorAll('a[data-target]'));
    const idToLink = new Map(linkEls.map(a => [a.getAttribute('data-target'), a]));
    const sectionIds = linkEls.map(a => a.getAttribute('data-target'));
    const sections = sectionIds
        .map(id => document.getElementById(id))
        .filter(Boolean);

    // Smooth scroll on click
    linkEls.forEach(a => {
        a.addEventListener('click', e => {
            e.preventDefault();
            const id = a.getAttribute('data-target');
            const el = document.getElementById(id);
            if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
        });
    });

    // Active state helper
    function setActive(id) {
        linkEls.forEach(a => {
            a.classList.remove('bg-blue-600', 'text-white');
            a.classList.add('bg-gray-100', 'text-gray-800');
        });
        const active = idToLink.get(id);
        if (active) {
            active.classList.remove('bg-gray-100', 'text-gray-800');
            active.classList.add('bg-blue-600', 'text-white');
        }
    }

    // Scrollspy using IntersectionObserver
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                setActive(entry.target.id);
            }
        });
    }, {
        root: null,
        // Favor the upper-middle viewport to decide active section
        rootMargin: '-20% 0px -60% 0px',
        threshold: 0.1
    });

    sections.forEach(sec => observer.observe(sec));

    // Back-to-top show/hide
    if (backToTop) {
        window.addEventListener('scroll', () => {
            if (window.scrollY > 400) backToTop.classList.remove('hidden');
            else backToTop.classList.add('hidden');
        }, { passive: true });
        backToTop.addEventListener('click', () => {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    }
});

// --- Student Management ---
function studentKey(level) {
    return 'students/' + level;
}

function addStudent(e, level) {
    e.preventDefault();
    const input = document.getElementById('input-student-' + level);
    const name = input ? input.value.trim() : '';
    if (!name) return false;
    const ref = db.ref(studentKey(level));
    ref.once('value').then(snap => {
        let arr = snap.val() || [];
        const student = { id: uuidv4(), name };
        arr.push(student);
        ref.set(arr).then(() => {
            if (input) input.value = '';
            updateStudentTable(level, arr);
        }).catch(err => {
            console.error('Error adding student to Firebase:', err);
        });
    });
    return false;
}

function updateStudentTable(level, students) {
    const tableBody = document.getElementById('students-' + level);
    if (!tableBody) return;
    tableBody.innerHTML = '';
    students.forEach(student => {
        const row = document.createElement('tr');
        const progressBtn = getProgressButton(level, student.id, student.name);
        row.innerHTML = `
            <td class="p-2 border-b text-left">${student.name}</td>
            <td class="p-2 border-b text-center space-x-2">
                ${progressBtn}
                <button class="text-red-500 hover:underline text-sm" onclick="removeStudent('${level}', '${student.id}')">Remove</button>
            </td>
        `;
        tableBody.appendChild(row);
    });
    const countSpan = document.querySelector(`#count-${level} .count-num`);
    if (countSpan) countSpan.textContent = students.length;
}

function getProgressButton(currentLevel, studentId, studentName) {
    // Ordered list of levels to compute previous/next
    const levels = ['cara-na-mara', 'taste-of-sailing', 'start-sailing', 'basic-skills', 'improving-skills'];
    const idx = levels.indexOf(currentLevel);
    if (idx === -1) return '';

    const prevLevel = idx > 0 ? levels[idx - 1] : null;
    const nextLevel = idx < levels.length - 1 ? levels[idx + 1] : null;

    function prettyName(levelKey) {
        return levelKey.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
    }

    const parts = [];
    if (prevLevel) {
        const prevName = prettyName(prevLevel);
        parts.push(`<button class="text-yellow-600 hover:text-yellow-800 text-sm font-medium mr-2" onclick="progressStudent('${currentLevel}', '${prevLevel}', '${studentId}', '${studentName.replace(/'/g, "\\'")}')">← ${prevName}</button>`);
    }
    if (nextLevel) {
        const nextName = prettyName(nextLevel);
        parts.push(`<button class="text-blue-600 hover:text-blue-800 text-sm font-medium" onclick="progressStudent('${currentLevel}', '${nextLevel}', '${studentId}', '${studentName.replace(/'/g, "\\'")}')">→ ${nextName}</button>`);
    }

    return parts.join('');
}

function progressStudent(fromLevel, toLevel, studentId, studentName) {
    if (!confirm(`Move ${studentName} from ${fromLevel} to ${toLevel}?`)) return;

    // Remove from current level
    const fromRef = db.ref(studentKey(fromLevel));
    fromRef.once('value').then(snap => {
        let fromArr = snap.val() || [];
        const student = fromArr.find(s => s.id === studentId);
        if (!student) {
            alert('Student not found in current level');
            return;
        }

        fromArr = fromArr.filter(s => s.id !== studentId);

        // Add to next level
        const toRef = db.ref(studentKey(toLevel));
        return toRef.once('value').then(toSnap => {
            let toArr = toSnap.val() || [];
            toArr.push(student);

            return Promise.all([
                fromRef.set(fromArr),
                toRef.set(toArr)
            ]);
        });
    }).then(() => {
        // Refresh both tables
        db.ref(studentKey(fromLevel)).once('value').then(snap => {
            updateStudentTable(fromLevel, snap.val() || []);
        });
        db.ref(studentKey(toLevel)).once('value').then(snap => {
            updateStudentTable(toLevel, snap.val() || []);
        });
        alert(`${studentName} moved to ${toLevel}!`);
    }).catch(err => {
        console.error('Error progressing student:', err);
        alert('Error moving student: ' + err.message);
    });
}

window.progressStudent = progressStudent;

function toggleResourcesSection() {
    const content = document.getElementById('resources-content');
    const icon = document.getElementById('resources-toggle-icon');
    if (content.style.display === 'none') {
        content.style.display = 'grid';
        icon.textContent = '▲';
    } else {
        content.style.display = 'none';
        icon.textContent = '▼';
    }
}

window.toggleResourcesSection = toggleResourcesSection;

function removeStudent(level, studentId) {
    const ref = db.ref(studentKey(level));
    ref.once('value').then(snap => {
        let arr = snap.val() || [];
        arr = arr.filter(student => student.id !== studentId);
        ref.set(arr).then(() => {
            updateStudentTable(level, arr);
        }).catch(err => {
            console.error('Error removing student from Firebase:', err);
        });
    });
}

window.addStudent = addStudent;
window.removeStudent = removeStudent;

document.addEventListener('DOMContentLoaded', () => {
    const levels = ['cara-na-mara', 'taste-of-sailing', 'start-sailing', 'basic-skills', 'improving-skills'];
    levels.forEach(level => {
        db.ref(studentKey(level)).once('value').then(snap => {
            updateStudentTable(level, snap.val() || []);
        });
    });
});

// --- Instructor/Boat Arrangement ---
function saveArrangementToFirebase(id, zoneId) {
    const draggable = document.getElementById(id);
    const name = draggable ? draggable.textContent.trim() : null;
    db.ref('arrangement/' + id).set({ zoneId, name });
}

function loadArrangementFromFirebase(callback) {
    db.ref('arrangement').once('value').then(snapshot => {
        callback(snapshot.val() || {});
    });
}

function clearArrangement() {
    db.ref('arrangement').remove().then(() => {
        const availableZone = document.getElementById('available-zone');
        if (availableZone) {
            document.querySelectorAll('#instructors-table .draggable:not(.boat)').forEach(item => {
                const inner = availableZone.querySelector('.flex.flex-wrap') || availableZone;
                inner.appendChild(item);
            });
        }
    }).catch(err => console.error('Error clearing arrangement from Firebase:', err));
}
// --- Arrangement Reset Helpers (restored after corruption) ---
const DEFAULT_BOAT_ORDER = [
    'boat-feva-1', 'boat-feva-2', 'boat-feva-3', 'boat-feva-4', 'boat-feva-5',
    'boat-topaz-1', 'boat-topaz-2', 'boat-topaz-3', 'boat-topaz-4', 'boat-topaz-5',
    'boat-vago-1', 'boat-bahia-1', 'boat-bahia-2'
];
const DEFAULT_INSTRUCTOR_ORDER = [
    'instructor-7', 'instructor-8',
    'instructor-1', 'instructor-2', 'instructor-3', 'instructor-4', 'instructor-5', 'instructor-6',
    'assistant-1', 'assistant-2', 'assistant-3', 'assistant-4', 'assistant-5', 'assistant-6', 'assistant-7', 'assistant-8'
];
function reorderContainerByIds(container, ids) {
    if (!container) return;
    const inner = container.querySelector('.flex.flex-wrap') || container;
    ids.forEach(id => {
        const el = document.getElementById(id);
        if (el) inner.appendChild(el);
    });
}
function clearInstructors() {
    // Remove instructor placements from Firebase then visually reset.
    db.ref('arrangement').once('value').then(snap => {
        const arrangement = snap.val() || {};
        const updates = {};
        Object.keys(arrangement).forEach(id => {
            const el = document.getElementById(id);
            if (el && !el.classList.contains('boat')) {
                updates['arrangement/' + id] = null;
            }
        });
        if (Object.keys(updates).length) return db.ref().update(updates);
        return null;
    }).catch(err => console.error('Error clearing instructors from Firebase:', err))
        .finally(() => {
            const availableZone = document.getElementById('available-zone');
            if (availableZone) {
                const inner = availableZone.querySelector('.flex.flex-wrap') || availableZone;
                document.querySelectorAll('#instructors-table .draggable:not(.boat)').forEach(item => {
                    item.style.left = ''; item.style.top = ''; item.style.position = '';
                    inner.appendChild(item);
                });
                reorderContainerByIds(availableZone, DEFAULT_INSTRUCTOR_ORDER);
            }
        });
}
window.clearInstructors = clearInstructors;
function clearBoats() {
    db.ref('arrangement').once('value').then(snap => {
        const arrangement = snap.val() || {};
        const updates = {};
        Object.keys(arrangement).forEach(id => {
            const el = document.getElementById(id);
            if (el && el.classList.contains('boat')) {
                updates['arrangement/' + id] = null;
            }
        });
        if (Object.keys(updates).length) return db.ref().update(updates);
        return null;
    }).catch(err => console.error('Error clearing boats from Firebase:', err))
        .finally(() => {
            const zone = document.getElementById('available-boats-zone');
            if (zone) {
                const inner = zone.querySelector('.flex.flex-wrap') || zone;
                DEFAULT_BOAT_ORDER.forEach(id => {
                    const el = document.getElementById(id);
                    if (el) {
                        el.style.left = ''; el.style.top = ''; el.style.position = '';
                        inner.appendChild(el);
                    }
                });
            }
        });
}
window.clearBoats = clearBoats;
function clearAll() {
    clearBoats();
    clearInstructors();
    clearAllStudentsAndNotes();
}
window.clearAll = clearAll;
function clearAllStudentsAndNotes() {
    const confirmMsg = 'Clear ALL students and ALL student notes for every level? This cannot be undone.';
    if (!confirm(confirmMsg)) return;
    const levels = ['cara-na-mara', 'taste-of-sailing', 'start-sailing', 'basic-skills', 'improving-skills'];
    const updates = {};
    levels.forEach(level => {
        updates['students/' + level] = null;
        updates['studentNotes/' + level] = null;
    });
    db.ref().update(updates).then(() => {
        const studentSelect = document.getElementById('notes-student-select');
        if (studentSelect) { studentSelect.innerHTML = '<option value="">Select student...</option>'; studentSelect.disabled = true; }
        const levelSelect = document.getElementById('notes-level-select');
        if (levelSelect) levelSelect.value = '';
        const display = document.getElementById('student-notes-display');
        if (display) display.classList.add('hidden');
        const historyEl = document.getElementById('notes-history');
        if (historyEl) historyEl.innerHTML = '';
        alert('All students and notes have been cleared.');
    }).catch(err => alert('Failed to clear: ' + err.message));
}

document.addEventListener('DOMContentLoaded', () => {
    const dropzones = document.querySelectorAll('.dropzone');
    dropzones.forEach(zone => {
        zone.addEventListener('dragover', e => {
            e.preventDefault();
            e.dataTransfer.dropEffect = 'move';
            zone.classList.add('ring', 'ring-blue-400', 'ring-4');
        });
        zone.addEventListener('dragleave', () => {
            zone.classList.remove('ring', 'ring-blue-400', 'ring-4');
        });
        zone.addEventListener('drop', e => {
            e.preventDefault();
            const id = e.dataTransfer.getData('text/plain');
            const draggable = document.getElementById(id);
            if (draggable) {
                const container = zone.querySelector('.flex.flex-wrap') || zone;
                container.appendChild(draggable);
                zone.classList.remove('ring', 'ring-blue-400', 'ring-4');
                saveArrangementToFirebase(id, zone.id);
            }
        });
    });
    const draggables = document.querySelectorAll('.draggable');
    draggables.forEach(item => {
        item.addEventListener('dragstart', e => {
            e.dataTransfer.setData('text/plain', e.target.id);
            e.dataTransfer.effectAllowed = 'move';
        });
    });
    function placeInZone(dropzone, el) {
        const container = dropzone.querySelector('.flex.flex-wrap') || dropzone;
        container.appendChild(el);
    }
    loadArrangementFromFirebase(arrangement => {
        Object.entries(arrangement).forEach(([id, data]) => {
            const draggable = document.getElementById(id);
            const dropzone = data && data.zoneId ? document.getElementById(data.zoneId) : null;
            if (draggable && dropzone) placeInZone(dropzone, draggable);
        });
    });
});

// Touch support for arrangement draggables
document.addEventListener('DOMContentLoaded', () => {
    const draggables = document.querySelectorAll('#instructors-table .draggable');
    let currentTouchZone = null;
    draggables.forEach(item => {
        let offsetX, offsetY, moving = false, dragStarted = false;
        let startX, startY;
        item.addEventListener('touchstart', function (e) {
            const touch = e.touches[0];
            offsetX = touch.clientX - item.getBoundingClientRect().left;
            offsetY = touch.clientY - item.getBoundingClientRect().top;
            startX = touch.clientX; startY = touch.clientY;
            moving = true; dragStarted = false;
            item._origPosition = item.style.position;
            item._origLeft = item.style.left;
            item._origTop = item.style.top;
            item._origZ = item.style.zIndex;
            document.body.style.userSelect = 'none';
            document.body.style.overflow = 'hidden';
        });
        item.addEventListener('touchmove', function (e) {
            if (!moving) return;
            const touch = e.touches[0];
            if (!dragStarted && (Math.abs(touch.clientX - startX) > 5 || Math.abs(touch.clientY - startY) > 5)) {
                dragStarted = true;
                item.style.position = 'fixed';
                item.style.zIndex = 1000;
                item.classList.add('dragging');
            }
            if (dragStarted) {
                item.style.left = `${touch.clientX - offsetX}px`;
                item.style.top = `${touch.clientY - offsetY}px`;
            }
            const elem = document.elementFromPoint(touch.clientX, touch.clientY);
            let foundZone = null; let el = elem;
            while (el) {
                if (el.classList && el.classList.contains('dropzone')) { foundZone = el; break; }
                el = el.parentElement;
            }
            if (currentTouchZone && currentTouchZone !== foundZone) currentTouchZone.classList.remove('ring', 'ring-blue-400', 'ring-4');
            currentTouchZone = foundZone;
            if (foundZone) foundZone.classList.add('ring', 'ring-blue-400', 'ring-4');
            e.preventDefault();
        });
        item.addEventListener('touchend', function (e) {
            moving = false;
            document.body.style.userSelect = '';
            document.body.style.overflow = '';
            item.classList.remove('dragging');
            if (currentTouchZone) currentTouchZone.classList.remove('ring', 'ring-blue-400', 'ring-4');
            if (dragStarted) {
                item.style.position = item._origPosition || '';
                item.style.left = item._origLeft || '';
                item.style.top = item._origTop || '';
                item.style.zIndex = item._origZ || '';
            }
            const touch = e.changedTouches[0];
            let dropTarget = document.elementFromPoint(touch.clientX, touch.clientY);
            let zoneEl = dropTarget;
            while (zoneEl && !(zoneEl.classList && zoneEl.classList.contains('dropzone'))) {
                zoneEl = zoneEl.parentElement;
            }
            if (zoneEl && zoneEl.classList && zoneEl.classList.contains('dropzone')) {
                const container = zoneEl.querySelector('.flex.flex-wrap') || zoneEl;
                container.appendChild(item);
                item.style.position = '';
                item.style.left = '';
                item.style.top = '';
                saveArrangementToFirebase(item.id, zoneEl.id);
            } else {
                item.style.position = '';
                item.style.left = '';
                item.style.top = '';
            }
            currentTouchZone = null;
        });
    });
});

// Ensure saved arrangement is applied after login shows content
function applySavedArrangement() {
    loadArrangementFromFirebase(arrangement => {
        Object.entries(arrangement).forEach(([id, data]) => {
            const draggable = document.getElementById(id);
            const dropzone = data && data.zoneId ? document.getElementById(data.zoneId) : null;
            if (draggable && dropzone) {
                const container = dropzone.querySelector('.flex.flex-wrap') || dropzone;
                container.appendChild(draggable);
            }
        });
    });
}

// --- Level Info Modal ---
const levelMap = {
    "cara-na-mara": "Cara na Mara",
    "taste-of-sailing": "Taste of Sailing",
    "start-sailing": "Start Sailing",
    "basic-skills": "Basic Skills",
    "improving-skills": "Improving Skills"
};
const draggableToLevel = {

    "cara-na-mara": "cara-na-mara",
    "taste-of-sailing": "taste-of-sailing",
    "start-sailing": "start-sailing",
    "basic-skills": "basic-skills",
    "improving-skills": "improving-skills"
};

function showLevelInfoModal(levelKey) {
    const modal = document.getElementById('level-info-modal');
    if (!modal) return;
    const title = document.getElementById('level-info-title');
    const instructorsList = document.getElementById('level-info-instructors');
    const studentsList = document.getElementById('level-info-students');
    const boatsList = document.getElementById('level-info-boats');
    if (!title || !instructorsList || !studentsList || !boatsList) return;
    title.textContent = levelMap[levelKey] || levelKey;
    instructorsList.innerHTML = '<li class="text-gray-400 italic">Loading...</li>';
    studentsList.innerHTML = '<li class="text-gray-400 italic">Loading...</li>';
    boatsList.innerHTML = '<li class="text-gray-400 italic">Loading...</li>';
    Promise.all([
        db.ref('arrangement').once('value'),
        db.ref('students/' + levelKey).once('value')
    ]).then(([arrSnap, stuSnap]) => {
        const arrangement = arrSnap.val() || {};
        const students = stuSnap.val() || {};
        const zoneId = levelKey + '-zone';
        const instructorNames = []; const boatNames = [];
        Object.entries(arrangement).forEach(([dragId, val]) => {
            if (val.zoneId === zoneId && val.name) {
                const el = document.getElementById(dragId);
                if (el && el.classList.contains('boat')) boatNames.push(val.name); else instructorNames.push(val.name);
            }
        });
        instructorsList.innerHTML = instructorNames.length ? instructorNames.map(n => `<li>${n}</li>`).join('') : '<li class="text-gray-400 italic">None assigned</li>';
        boatsList.innerHTML = boatNames.length ? boatNames.map(n => `<li>${n}</li>`).join('') : '<li class="text-gray-400 italic">None</li>';
        studentsList.innerHTML = students.length ? students.map(s => `<li>${s.name}</li>`).join('') : '<li class="text-gray-400 italic">None</li>';
    });
    modal.style.display = 'flex';
}

window.showLevelInfoModal = showLevelInfoModal;

document.addEventListener('DOMContentLoaded', () => {
    ["cara-na-mara", "taste-of-sailing", "start-sailing", "basic-skills", "improving-skills"].forEach(id => {
        const el = document.getElementById(id);
        if (el) {
            el.addEventListener('dblclick', e => {
                e.stopPropagation();
                showLevelInfoModal(draggableToLevel[id]);
            });
        }
    });
    const closeBtn = document.getElementById('close-level-info-modal');
    if (closeBtn) closeBtn.onclick = () => { const m = document.getElementById('level-info-modal'); if (m) m.style.display = 'none'; };
    const modal = document.getElementById('level-info-modal');
    if (modal) modal.addEventListener('click', e => { if (e.target === modal) modal.style.display = 'none'; });
});

// --- Repairs Log ---
function saveRepairLog(detail) {
    const ref = db.ref('repairsLog').push();
    const entry = { detail, timestamp: Date.now(), fixed: false, fixedAt: null, fixedBy: null };
    return ref.set(entry);
}
function loadRepairLogs(callback) {
    db.ref('repairsLog').orderByChild('timestamp').limitToLast(200).once('value').then(snap => {
        const logs = []; snap.forEach(child => { logs.push({ id: child.key, ...child.val() }); });
        logs.sort((a, b) => b.timestamp - a.timestamp);
        callback(logs);
    });
}
function markRepairFixed(id) {
    const user = auth.currentUser;
    const updates = { fixed: true, fixedAt: Date.now(), fixedBy: user ? (currentUserName || user.email.split('@')[0]) : 'unknown' };
    return db.ref('repairsLog/' + id).update(updates).then(() => loadRepairLogs(renderRepairLogs));
}
function markRepairUnfixed(id) {
    const updates = { fixed: false, fixedAt: null, fixedBy: null };
    return db.ref('repairsLog/' + id).update(updates).then(() => loadRepairLogs(renderRepairLogs));
}
function renderRepairLogs(logs) {
    const ul = document.getElementById('repairs-log-list');
    if (!ul) return;
    ul.innerHTML = '';
    if (!logs.length) { ul.innerHTML = '<li class="py-2 text-gray-400 italic">No repairs logged yet.</li>'; return; }
    logs.forEach(log => {
        const dateStr = new Date(log.timestamp).toLocaleString();
        const isFixed = !!log.fixed;
        const fixedAtStr = log.fixedAt ? new Date(log.fixedAt).toLocaleString() : '';
        const badge = isFixed ? `<span class="text-xs font-semibold text-green-800 bg-green-100 px-2 py-0.5 rounded">Fixed</span>` : `<span class="text-xs font-semibold text-red-800 bg-red-100 px-2 py-0.5 rounded">Unfixed</span>`;
        const actionBtn = isFixed
            ? `<button onclick="markRepairUnfixed('${log.id}')" class="ml-2 text-sm px-2 py-0.5 rounded bg-yellow-200 text-yellow-800 hover:bg-yellow-300">Reopen</button>`
            : `<button onclick="markRepairFixed('${log.id}')" class="ml-2 text-sm px-2 py-0.5 rounded bg-green-600 text-white hover:bg-green-700">Mark Fixed</button>`;

        const meta = isFixed ? ` <span class="text-xs text-gray-600">(fixed: ${fixedAtStr})</span>` : '';
        const liClass = isFixed ? 'py-2 border-l-4 border-green-400 pl-3 bg-green-50 rounded mb-2' : 'py-2 border-l-4 border-red-400 pl-3 bg-red-50 rounded mb-2';

        ul.innerHTML += `<li class="${liClass}"><div class="flex items-center justify-between"><div><span class="font-semibold text-blue-800">${dateStr}:</span> <span class="text-gray-800">${escapeHtml(log.detail)}</span>${meta}</div><div class="ml-4">${badge}${actionBtn}</div></div></li>`;
    });
}
document.addEventListener('DOMContentLoaded', () => {
    loadRepairLogs(renderRepairLogs);
    const form = document.getElementById('repairs-log-form');
    if (form) {
        form.addEventListener('submit', e => {
            e.preventDefault();
            const input = document.getElementById('repair-detail');
            const detail = input ? input.value.trim() : '';
            if (!detail) return;
            saveRepairLog(detail).then(() => {
                if (input) input.value = '';
                loadRepairLogs(renderRepairLogs);
            });
        });
    }
});

// Expose repair mark/unmark helpers globally for inline onclick handlers
window.markRepairFixed = markRepairFixed;
window.markRepairUnfixed = markRepairUnfixed;

// --- UUID Generator ---
function uuidv4() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
        const r = (Math.random() * 16) | 0,
            v = c === 'x' ? r : (r & 0x3) | 0x8;
        return v.toString(16);
    });
}

// --- UI Helpers ---
function toggleDarkMode() {
    document.body.classList.toggle('dark');
}

// Jump to Select
const jumpSelect = document.getElementById('jump-to-select');
if (jumpSelect) {
    jumpSelect.addEventListener('change', function (e) {
        const val = e.target.value;
        if (val) {
            const el = document.querySelector(val);
            if (el) {
                el.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
            e.target.value = '';
        }
    });
}

// Helper function to convert degrees to cardinal direction
function getCardinalDirection(degrees) {
    const directions = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'];
    const index = Math.round(((degrees % 360) / 45)) % 8;
    return directions[index];
}

// Helper function to get Beaufort description from knots
function getBeaufortDescription(knots) {
    if (knots < 1) return 'Calm';
    if (knots < 4) return 'Light Air';
    if (knots < 7) return 'Light Breeze';
    if (knots < 11) return 'Gentle Breeze';
    if (knots < 17) return 'Moderate Breeze';
    if (knots < 22) return 'Fresh Breeze';
    if (knots < 28) return 'Strong Breeze';
    if (knots < 34) return 'Near Gale';
    if (knots < 41) return 'Gale';
    if (knots < 48) return 'Strong Gale';
    if (knots < 56) return 'Storm';
    if (knots < 64) return 'Violent Storm';
    return 'Hurricane';
}

// --- Open-Meteo Weather Fetching ---
async function fetchWeather() {
    // Default coordinates for Rathmullan, Co. Donegal, Ireland
    // You can override these by adding an element with id="weather-coords" and data-lat / data-lon attributes.
    const DEFAULT_LAT = 55.09;
    const DEFAULT_LON = -7.54;
    let lat = DEFAULT_LAT;
    let lon = DEFAULT_LON;
    try {
        const coordEl = document.getElementById('weather-coords');
        if (coordEl) {
            const dlat = coordEl.getAttribute('data-lat');
            const dlon = coordEl.getAttribute('data-lon');
            if (dlat && dlon) {
                const parsedLat = parseFloat(dlat);
                const parsedLon = parseFloat(dlon);
                if (!Number.isNaN(parsedLat) && !Number.isNaN(parsedLon)) {
                    lat = parsedLat;
                    lon = parsedLon;
                }
            }
        }
    } catch (e) {
        // fallback to defaults
    }

    // Use Ireland timezone explicitly so times match local expectations
    const TZ = 'Europe/Dublin';
    const apiUrl = `https://api.open-meteo.com/v1/forecast?latitude=${encodeURIComponent(lat)}&longitude=${encodeURIComponent(lon)}&current=temperature_2m,relative_humidity_2m,pressure_msl,wind_speed_10m,wind_direction_10m,wind_gusts_10m&hourly=wind_speed_10m,wind_gusts_10m&wind_speed_unit=ms&timezone=${encodeURIComponent(TZ)}&past_days=1`;
    console.info('Fetching Open-Meteo for Rathmullan at', { lat, lon, TZ, apiUrl });

    try {
        const response = await fetch(apiUrl);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();

        // --- Populate Current Weather ---
        const tempEl = document.getElementById('weather-temp');
        const windEl = document.getElementById('weather-wind');
        const humidityEl = document.getElementById('weather-humidity');
        const pressureEl = document.getElementById('weather-pressure');

        if (data.current) {
            if (tempEl) tempEl.innerHTML = `${Math.round(data.current.temperature_2m)}°`;
            if (humidityEl) humidityEl.textContent = `${data.current.relative_humidity_2m}%`;
            if (pressureEl) pressureEl.textContent = `${Math.round(data.current.pressure_msl)}`;

            // Convert wind speed from m/s to knots and update wind display
            if (data.current.wind_speed_10m !== undefined) {
                const windSpeedKnots = Math.round(data.current.wind_speed_10m * 1.94384 * 10) / 10;
                const windGustKnots = data.current.wind_gusts_10m ? Math.round(data.current.wind_gusts_10m * 1.94384 * 10) / 10 : windSpeedKnots;
                const windDirection = data.current.wind_direction_10m || 0;

                if (windEl) windEl.textContent = windSpeedKnots;

                // Update wind arrow rotation
                const arrow = document.getElementById('wind-arrow');
                if (arrow) {
                    arrow.setAttribute('transform', `rotate(${windDirection + 180} 50 50)`);
                }

                // Update wind direction text
                const dirLetter = document.getElementById('wind-direction-letter');
                const dirDegrees = document.getElementById('wind-direction-degrees');
                if (dirLetter) dirLetter.textContent = getCardinalDirection(windDirection);
                if (dirDegrees) dirDegrees.textContent = `${Math.round(windDirection)}°`;

                // Update gust speed
                const gustEl = document.getElementById('wind-gust');
                if (gustEl) gustEl.textContent = `${windGustKnots} kts`;

                // Update beaufort description
                const beaufortEl = document.getElementById('wind-beaufort');
                if (beaufortEl) beaufortEl.textContent = getBeaufortDescription(windSpeedKnots);
            }
        }

        // --- Render Wind Chart ---
        if (data.hourly && data.hourly.time && data.hourly.wind_speed_10m && data.hourly.wind_gusts_10m) {
            const windCanvas = document.getElementById('wind-graph');
            // Wait for Chart.js and plugins to load
            if (windCanvas && window.Chart && window.ChartLoaded) {
                // Register plugins if not already registered
                if (window.chartjsPluginZoom && !Chart.registry.plugins.get('zoom')) {
                    Chart.register(window.chartjsPluginZoom);
                }
                if (window.chartjsPluginAnnotation && !Chart.registry.plugins.get('annotation')) {
                    Chart.register(window.chartjsPluginAnnotation);
                }

                // Build time-based data points (every 3rd hour) so we can use a time x-axis
                const hourlyData = data.hourly;
                const windData = [];
                const gustData = [];

                hourlyData.time.forEach((t, i) => {
                    if (i % 3 === 0) {
                        const speed = Math.round((hourlyData.wind_speed_10m[i] * 1.94384) * 10) / 10;
                        const gust = Math.round((hourlyData.wind_gusts_10m[i] * 1.94384) * 10) / 10;
                        windData.push({ x: t, y: speed });
                        gustData.push({ x: t, y: gust });
                    }
                });

                // Calculate chart x-axis limits from the actual data range (with a small padding)
                const now = new Date();
                const nowMs = now.getTime();
                const HOUR_MS = 60 * 60 * 1000;
                const xTimes = windData.map(d => new Date(d.x).getTime()).filter(t => !Number.isNaN(t));
                let dataMin = new Date(nowMs - 48 * HOUR_MS);
                let dataMax = new Date(nowMs + 48 * HOUR_MS);
                if (xTimes.length) {
                    dataMin = new Date(Math.min(...xTimes));
                    dataMax = new Date(Math.max(...xTimes));
                }
                const PADDING_MS = 30 * 60 * 1000; // 30 minutes padding on each side
                const minLimit = new Date(dataMin.getTime() - PADDING_MS);
                const maxLimit = new Date(dataMax.getTime() + PADDING_MS);

                const windChart = new Chart(windCanvas, {
                    type: 'line',
                    data: {
                        datasets: [
                            {
                                label: 'Wind Speed (knots)',
                                data: windData,
                                borderColor: 'rgb(59, 130, 246)',
                                backgroundColor: 'rgba(59, 130, 246, 0.1)',
                                fill: true,
                                tension: 0.4,
                                pointRadius: 0,
                            },
                            {
                                label: 'Wind Gusts (knots)',
                                data: gustData,
                                borderColor: 'rgb(239, 68, 68)',
                                backgroundColor: 'rgba(239, 68, 68, 0.1)',
                                fill: true,
                                tension: 0.4,
                                borderDash: [5, 5],
                                pointRadius: 0,
                            }
                        ]
                    },
                    options: {
                        responsive: true,
                        maintainAspectRatio: false,
                        interaction: {
                            mode: 'index',
                            intersect: false,
                        },
                        plugins: {
                            // Zoom & pan (chartjs-plugin-zoom)
                            zoom: {
                                pan: {
                                    // Disable user panning; only allow built-in controls
                                    enabled: false,
                                    mode: 'x',
                                },
                                zoom: {
                                    // Disable wheel/pinch zoom so scrolling doesn't change the view
                                    wheel: {
                                        enabled: false,
                                        speed: 0.1,
                                    },
                                    pinch: {
                                        enabled: false,
                                    },
                                    mode: 'x',
                                },
                                limits: {
                                    x: {
                                        min: minLimit.getTime(),
                                        max: maxLimit.getTime(),
                                    }
                                }
                            },
                            // Now line annotation (chartjs-plugin-annotation)
                            annotation: {
                                annotations: {
                                    nowLine: {
                                        type: 'line',
                                        xMin: now,
                                        xMax: now,
                                        borderColor: 'rgba(16, 185, 129, 0.9)',
                                        borderWidth: 2,
                                        borderDash: [6, 6],
                                        label: {
                                            content: 'Now',
                                            enabled: true,
                                            position: 'start',
                                            backgroundColor: 'rgba(16, 185, 129, 0.9)',
                                            color: '#fff',
                                            font: {
                                                size: 10,
                                            }
                                        }
                                    }
                                }
                            }
                        },
                        scales: {
                            y: {
                                beginAtZero: true,
                                title: {
                                    display: true,
                                    text: 'Knots'
                                }
                            },
                            x: {
                                type: 'time',
                                time: {
                                    unit: 'hour',
                                    tooltipFormat: 'HH:mm',
                                    displayFormats: {
                                        hour: 'HH:mm'
                                    }
                                },
                                adapters: {
                                    date: {
                                        zone: 'UTC'
                                    }
                                },
                                ticks: {
                                    autoSkip: true,
                                    maxTicksLimit: 8,
                                },
                                min: minLimit,
                                max: maxLimit,
                            }
                        }
                    }
                });

                // Store chart instance globally for controls
                window.windChartInstance = windChart;
                window.windChartNowTime = now.getTime();
                window.windChartMinLimit = minLimit.getTime();
                window.windChartMaxLimit = maxLimit.getTime();
            }
        }

    } catch (error) {
        console.error("Could not fetch or process weather data:", error);
        const weatherDisplay = document.getElementById('weather-display');
        if (weatherDisplay) {
           const errorHolder = document.createElement('div');
           errorHolder.innerHTML = `<p class="col-span-full text-center text-red-500 p-4">Could not load live weather data.</p>`;
           weatherDisplay.prepend(errorHolder);
        }
    }

    // Render tide chart when data becomes available (with retry)
    let tideRetries = 0;
    const maxTideRetries = 10;
    function tryRenderTideChart() {
        if (window.tideData) {
            window.renderTideChart();
        } else if (tideRetries < maxTideRetries) {
            tideRetries++;
            setTimeout(tryRenderTideChart, 500);
        }
    }
    tryRenderTideChart();
}

// Render tide chart using data from tides.js (exposed globally)
window.renderTideChart = function() {
    // Prevent multiple simultaneous renders
    if (window.tideChartRendering) {
        return;
    }
    window.tideChartRendering = true;

    const data = window.tideData;
    if (!data) {
        window.tideChartRendering = false;
        return;
    }

    try {
        // Get tide events from the data
        const tideEvents = [];

        // Collect events from next array
        if (Array.isArray(data.next)) {
            tideEvents.push(...data.next.slice(0, 8));
        }

        // Also check next_seven_days for more events
        if (data.next_seven_days) {
            Object.keys(data.next_seven_days).forEach(dayKey => {
                const dayData = data.next_seven_days[dayKey];
                const events = dayData.tidal_events || dayData.tides || dayData.tide_events || dayData.events || [];
                tideEvents.push(...events);
            });
        }

        if (tideEvents.length < 2) {
            return;
        }

        // Sort by timestamp
        tideEvents.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
        const tideData = [];
        const now = new Date();
        const startTime = new Date(now.getTime() - 24 * 60 * 60 * 1000); // -24 hours
        const endTime = new Date(now.getTime() + 24 * 60 * 60 * 1000); // +24 hours

        // Generate points every 15 minutes between tide events
        for (let i = 0; i < tideEvents.length - 1; i++) {
            const lastEvent = tideEvents[i];
            const nextEvent = tideEvents[i + 1];
            const lastTs = new Date(lastEvent.timestamp).getTime();
            const nextTs = new Date(nextEvent.timestamp).getTime();
            const duration = nextTs - lastTs;
            const steps = Math.ceil(duration / (15 * 60 * 1000)); // 15 min intervals

            for (let j = 0; j <= steps; j++) {
                const t = lastTs + (duration * j / steps);
                if (t < startTime.getTime() || t > endTime.getTime()) continue;

                const f = j / steps; // Fraction through this tide cycle
                const height = calculateRuleOfTwelfthsHeight(lastEvent.height_cm, nextEvent.height_cm, f);
                tideData.push({ x: new Date(t), y: height / 100 }); // Convert cm to meters
            }
        }

        // Render the tide chart
        const tideCanvas = document.getElementById('tide-graph');
        if (tideCanvas && window.Chart && window.ChartLoaded && tideData.length > 0) {
            // Destroy existing chart if it exists
            if (window.tideChartInstance) {
                window.tideChartInstance.destroy();
            }

            // Compute x-axis limits from actual data range so the chart only shows regions with data
            const xTimes = tideData.map(d => new Date(d.x).getTime()).filter(t => !Number.isNaN(t));
            // Fallback to +/-24h if no valid points
            let dataMin = new Date(now.getTime() - 24 * 60 * 60 * 1000);
            let dataMax = new Date(now.getTime() + 24 * 60 * 60 * 1000);
            if (xTimes.length) {
                dataMin = new Date(Math.min(...xTimes));
                dataMax = new Date(Math.max(...xTimes));
            }
            const PADDING_MS = 30 * 60 * 1000; // 30 minutes padding
            const minLimit = new Date(dataMin.getTime() - PADDING_MS);
            const maxLimit = new Date(dataMax.getTime() + PADDING_MS);

            window.tideChartInstance = new Chart(tideCanvas, {
                type: 'line',
                data: {
                    datasets: [{
                        label: 'Tide Height (m)',
                        data: tideData,
                        borderColor: 'rgb(59, 130, 246)',
                        backgroundColor: 'rgba(59, 130, 246, 0.2)',
                        fill: true,
                        tension: 0.4,
                        pointRadius: 0,
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    interaction: {
                        mode: 'index',
                        intersect: false,
                    },
                    plugins: {
                        annotation: {
                            annotations: {
                                nowLine: {
                                    type: 'line',
                                    xMin: now,
                                    xMax: now,
                                    borderColor: 'rgba(16, 185, 129, 0.9)',
                                    borderWidth: 2,
                                    borderDash: [6, 6],
                                    label: {
                                        content: 'Now',
                                        enabled: true,
                                        position: 'start',
                                        backgroundColor: 'rgba(16, 185, 129, 0.9)',
                                        color: '#fff',
                                        font: {
                                            size: 10,
                                        }
                                    }
                                }
                            }
                        }
                    },
                    scales: {
                        y: {
                            beginAtZero: true,
                            title: {
                                display: true,
                                text: 'Height (m)'
                            }
                        },
                        x: {
                            type: 'time',
                            time: {
                                unit: 'hour',
                                tooltipFormat: 'HH:mm',
                                displayFormats: {
                                    hour: 'HH:mm'
                                }
                            },
                            adapters: {
                                date: {
                                    zone: 'UTC'
                                }
                            },
                            ticks: {
                                autoSkip: true,
                                maxTicksLimit: 8,
                            },
                            // Set min/max to the computed data limits so chart shows only regions with data
                            min: minLimit,
                            max: maxLimit,
                        }
                    }
                }
            });
        }

    } catch (error) {
        console.error("Could not render tide chart:", error);
    } finally {
        window.tideChartRendering = false;
    }
}// Calculate height using Rule of Twelfths
function calculateRuleOfTwelfthsHeight(startHeight, endHeight, fraction) {
    // Rule of twelfths weights for the six equal time segments
    const weights = [1, 2, 3, 3, 2, 1];
    const totalTwelfths = 12;
    const segments = 6;

    // Calculate cumulative proportions at segment boundaries
    const segProps = [];
    let acc = 0;
    for (let i = 0; i < segments; i++) {
        acc += weights[i];
        segProps[i] = acc / totalTwelfths;
    }

    // Map continuous fraction into cumulative proportion
    const segIndex = Math.min(segments - 1, Math.floor(fraction * segments));
    const prevProp = segIndex === 0 ? 0 : segProps[segIndex - 1];
    const withinSeg = (fraction * segments) - segIndex;
    const segProp = (weights[segIndex] / totalTwelfths) * withinSeg;
    const currentProp = prevProp + segProp;

    const delta = endHeight - startHeight;
    return startHeight + delta * currentProp;
}

// Initialize Weekly Plan Inputs
document.addEventListener('DOMContentLoaded', () => {
    // Wait for Chart.js plugins to load before fetching weather
    function tryFetchWeather() {
        if (window.ChartLoaded) {
            fetchWeather();
        } else {
            setTimeout(tryFetchWeather, 100);
        }
    }
    tryFetchWeather();

    weeklyLevels.forEach(level => {
        const btn = document.querySelector(`button[data-level="${level}"]`);
        if (btn) {
            btn.onclick = function () {
                const input = document.getElementById(`input-${level}`);
                const activity = input.value.trim();
                if (!activity) return;

                const today = days[new Date().getDay() - 1] || "mon";
                let added = false;
                for (let slot of slots) {
                    const cell = document.querySelector(`.weekly-slot[data-level="${level}"][data-day="${today}"][data-slot="${slot}"]`);
                    if (cell && cell.childNodes.length === 0) {
                        addActivity(level, today, slot, activity);
                        input.value = '';
                        added = true;
                        break;
                    }
                }
                if (!added) {
                    addActivity(level, today, slots[0], activity);
                    input.value = '';
                }
            };
        }

        const input = document.getElementById(`input-${level}`);
        if (input) {
            input.addEventListener('keydown', function (e) {
                if (e.key === "Enter") {
                    e.preventDefault();
                    const btn = document.querySelector(`button[data-level="${level}"]`);
                    if (btn) btn.click();
                }
            });
        }
    });

    // Sign up logic moved into unified form submit via authMode toggle

    // Weekly activity click to edit/delete
    document.addEventListener('click', function (e) {
        if (e.target.classList.contains('weekly-activity')) {
            const actDiv = e.target;
            const actId = actDiv.getAttribute('data-id');
            const parentSlot = actDiv.closest('.weekly-slot');
            if (!parentSlot) return;
            const level = parentSlot.getAttribute('data-level');
            const day = parentSlot.getAttribute('data-day');
            const slot = parentSlot.getAttribute('data-slot');
            const action = window.prompt(`Edit or delete activity:\n\nCurrent: "${actDiv.textContent}"\n\nType new text to edit, or leave blank and press OK to delete. Press Cancel to abort.`);
            if (action === null) return;
            if (action.trim() === "") {
                removeActivity(level, day, slot, actId);
            } else if (action.trim() !== actDiv.textContent.trim()) {
                editActivity(level, day, slot, actId, action.trim());
            }
        }
    });
});

// Expose weekly planning functions globally
window.addActivity = addActivity;
window.updateWeeklySlot = updateWeeklySlot;
window.removeActivity = removeActivity;
window.editActivity = editActivity;
window.moveWeeklyActivity = moveWeeklyActivity;
window.loadWeeklyPlans = loadWeeklyPlans;

// --- Instructor Chat Logic ---
const EDIT_WINDOW_MS = 20 * 60 * 1000; // 20 minutes
let selectedFile = null;
function initChat() {
    // Prevent re-initializing (which causes duplicate listeners & duplicate messages)
    if (chatInitialized) return;
    const messagesEl = document.getElementById('chat-messages');
    const form = document.getElementById('chat-form');
    const input = document.getElementById('chat-input');
    const fileInput = document.getElementById('chat-file-input');
    const attachBtn = document.getElementById('chat-attach-btn');
    const uploadPreview = document.getElementById('chat-upload-preview');
    const previewName = document.getElementById('chat-preview-name');
    const cancelUploadBtn = document.getElementById('chat-cancel-upload');
    if (!messagesEl || !form || !input) return;
    chatInitialized = true;
    chatMessagesRef = db.ref('chat/messages');

    // Listen for new messages (only once)
    chatMessagesRef.limitToLast(200).on('child_added', snap => {
        const msg = snap.val();
        const id = snap.key;
        if (!msg || !id) return;
        // Avoid duplicates if element already exists
        if (messagesEl.querySelector(`[data-msg-id="${id}"]`)) return;
        appendChatMessage(messagesEl, id, msg);
    });

    // Listen for edits
    chatMessagesRef.on('child_changed', snap => {
        const msg = snap.val();
        const id = snap.key;
        if (!msg || !id) return;
        updateChatMessageUI(id, msg);
    });

    // Listen for deletions
    chatMessagesRef.on('child_removed', snap => {
        const id = snap.key;
        const el = messagesEl.querySelector(`[data-msg-id="${id}"]`);
        if (el) el.remove();
    });

    // Attach button click
    if (attachBtn && fileInput) {
        attachBtn.addEventListener('click', () => fileInput.click());
    }

    // File selection
    if (fileInput && uploadPreview && previewName) {
        fileInput.addEventListener('change', e => {
            const file = e.target.files[0];
            if (!file) return;
            // Validate file type and size (max 10MB)
            if (!file.type.startsWith('image/') && !file.type.startsWith('video/') && file.type !== 'application/pdf') {
                alert('Please select an image, video, or PDF file.');
                fileInput.value = '';
                return;
            }
            if (file.size > 10 * 1024 * 1024) {
                alert('File size must be less than 10MB.');
                fileInput.value = '';
                return;
            }
            selectedFile = file;
            previewName.textContent = file.name;
            uploadPreview.classList.remove('hidden');
        });
    }

    // Cancel upload
    if (cancelUploadBtn && fileInput && uploadPreview) {
        cancelUploadBtn.addEventListener('click', () => {
            selectedFile = null;
            fileInput.value = '';
            uploadPreview.classList.add('hidden');
        });
    }

    form.addEventListener('submit', e => {
        e.preventDefault();
        const text = input.value.trim();
        if (!text && !selectedFile) return;
        sendChatMessage(text, selectedFile).then(() => {
            input.value = '';
            if (selectedFile) {
                selectedFile = null;
                if (fileInput) fileInput.value = '';
                if (uploadPreview) uploadPreview.classList.add('hidden');
            }
        }).catch(err => {
            console.error('Chat send error:', err);
            alert('Error sending message: ' + err.message);
        });
    });

    // Removed manual Enter key handler to avoid double submits; form submit handles Enter by default.
}

function sendChatMessage(text, file) {
    const user = auth.currentUser;
    const name = currentUserName || (user && user.email ? user.email.split('@')[0] : 'Instructor');
    const ref = db.ref('chat/messages').push();
    const msgId = ref.key;

    // If file attached, convert to base64 and store in database (no Firebase Storage needed)
    if (file) {
        // Check file size (limit to 5MB for PDFs, 1MB for images/videos)
        const maxSize = file.type === 'application/pdf' ? 5 * 1024 * 1024 : 1024 * 1024;
        if (file.size > maxSize) {
            const limit = file.type === 'application/pdf' ? '5MB' : '1MB';
            alert(`File too large. Please use files under ${limit}.`);
            return Promise.reject(new Error('File too large'));
        }

        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = function (e) {
                let mediaType = 'video';
                if (file.type.startsWith('image/')) mediaType = 'image';
                else if (file.type === 'application/pdf') mediaType = 'pdf';

                const data = {
                    userId: user ? user.uid : 'anon',
                    name,
                    text: text.slice(0, 500),
                    mediaUrl: e.target.result, // base64 data URL
                    mediaType: mediaType,
                    fileName: file.name, // Store original filename for PDFs
                    ts: Date.now()
                };
                ref.set(data).then(resolve).catch(reject);
            };
            reader.onerror = reject;
            reader.readAsDataURL(file);
        });
    } else {
        // Text-only message
        const safeText = text.slice(0, 500);
        const data = { userId: user ? user.uid : 'anon', name, text: safeText, ts: Date.now() };
        return ref.set(data);
    }
}

function formatTimestamp(ts) {
    const date = new Date(ts || Date.now());
    const dateStr = date.toLocaleDateString();
    const timeStr = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    return `${dateStr} ${timeStr}`;
}

function appendChatMessage(container, id, msg) {
    const div = document.createElement('div');
    div.setAttribute('data-msg-id', id);
    const tsDisplay = formatTimestamp(msg.ts);
    div.className = 'flex flex-col group relative border-b border-blue-50 pb-1';
    div.innerHTML = renderMessageInner(id, msg, tsDisplay);
    container.appendChild(div);
    container.scrollTop = container.scrollHeight;
    attachMessageActions(div, id, msg);
}

function renderMessageInner(id, msg, tsDisplay) {
    const user = auth.currentUser;
    const isOwner = user && msg.userId === user.uid;
    const now = Date.now();
    const canEdit = isOwner && (now - (msg.ts || 0) <= EDIT_WINDOW_MS) && !msg.mediaUrl; // Can't edit media messages
    const editedTag = msg.editedAt ? `<span class="text-[10px] text-gray-400 ml-1">(edited)</span>` : '';
    // Allow delete for all owner messages including images
    const actionsHtml = isOwner
        ? `<div class="flex gap-2 ml-2 transition-opacity duration-150">
                ${canEdit ? `<button data-action="edit" title="Edit (20 min window)" class="px-2 py-0.5 rounded bg-blue-600 text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-300 transition text-[10px] font-medium">Edit</button>` : ''}
                <button data-action="delete" title="Delete message" class="px-2 py-0.5 rounded bg-red-600 text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-300 transition text-[10px] font-medium">Delete</button>
           </div>`
        : '';

    // Render media if present
    let mediaHtml = '';
    if (msg.mediaUrl && msg.mediaType === 'image') {
        mediaHtml = `<div class="mt-2"><img src="${escapeHtml(msg.mediaUrl)}" alt="Image" class="max-w-xs max-h-64 rounded border border-gray-300 hover:opacity-90 transition cursor-pointer" onclick="showImageModal('${escapeHtml(msg.mediaUrl).replace(/'/g, "\\'")}', '${escapeHtml(msg.name || 'Instructor').replace(/'/g, "\\'")}')"></div>`;
    } else if (msg.mediaUrl && msg.mediaType === 'video') {
        mediaHtml = `<div class="mt-2"><video controls class="max-w-xs max-h-64 rounded border border-gray-300"><source src="${escapeHtml(msg.mediaUrl)}" type="video/mp4">Your browser does not support video.</video></div>`;
    } else if (msg.mediaUrl && msg.mediaType === 'pdf') {
        const fileName = msg.fileName || 'document.pdf';
        mediaHtml = `<div class="mt-2"><a href="${escapeHtml(msg.mediaUrl)}" download="${escapeHtml(fileName)}" target="_blank" class="inline-flex items-center gap-2 px-4 py-2 bg-red-50 border border-red-200 rounded hover:bg-red-100 transition-colors">
            <svg class="w-5 h-5 text-red-600" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clip-rule="evenodd"></path>
            </svg>
            <span class="text-sm font-medium text-gray-700">📄 ${escapeHtml(fileName)}</span>
        </a></div>`;
    }

    // Auto-linkify URLs in text
    const textContent = msg.text ? linkify(escapeHtml(msg.text)) : '';

    return `<span class="text-[11px] text-gray-500">${tsDisplay}</span>
            <div class="flex items-start">
                <span class="font-semibold text-blue-700">${escapeHtml(msg.name || 'Instructor')}</span>:
                <span class="ml-1 break-words">${textContent}</span>
                ${editedTag}
                ${actionsHtml}
            </div>
            ${mediaHtml}`;
}

// Helper to convert URLs in text to clickable links
function linkify(text) {
    const urlRegex = /(https?:\/\/[^\s]+)/g;
    return text.replace(urlRegex, '<a href="$1" target="_blank" rel="noopener" class="text-blue-600 hover:underline break-all">$1</a>');
}

function attachMessageActions(div, id, msg) {
    const user = auth.currentUser;
    if (!user || msg.userId !== user.uid) return; // Only owner gets actions
    div.addEventListener('click', e => {
        const target = e.target;
        if (!(target instanceof HTMLElement)) return;
        const action = target.getAttribute('data-action');
        if (!action) return;
        if (action === 'edit') {
            const now = Date.now();
            if (now - (msg.ts || 0) > EDIT_WINDOW_MS) {
                alert('Edit window (20 minutes) has expired for this message.');
                updateChatMessageUI(id, msg); // Refresh UI (remove stale edit button)
                return;
            }
            const newText = prompt('Edit your message:', msg.text);
            if (newText === null) return; // cancelled
            const trimmed = newText.trim();
            if (!trimmed) {
                alert('Cannot set empty message. Delete instead if you wish.');
                return;
            }
            updateChatMessage(id, trimmed);
        } else if (action === 'delete') {
            if (confirm('Delete this message? This cannot be undone.')) {
                deleteChatMessage(id);
            }
        }
    });
}

function updateChatMessage(id, newText) {
    const ref = db.ref('chat/messages/' + id);
    return ref.update({ text: newText.slice(0, 500), editedAt: Date.now() });
}

function deleteChatMessage(id) {
    const ref = db.ref('chat/messages/' + id);
    return ref.remove();
}

function updateChatMessageUI(id, msg) {
    const container = document.getElementById('chat-messages');
    if (!container) return;
    const el = container.querySelector(`[data-msg-id="${id}"]`);
    if (!el) return;
    const tsDisplay = formatTimestamp(msg.ts);
    el.innerHTML = renderMessageInner(id, msg, tsDisplay);
    attachMessageActions(el, id, msg);
}

function escapeHtml(str) {
    if (str === null || str === undefined) return '';
    return String(str).replace(/[&<>"']/g, function (c) {
        return ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', '\'': '&#39;' }[c]);
    });
}

window.sendChatMessage = sendChatMessage;

// --- Weekly Slot Drag & Drop (moved from inline HTML) ---
document.addEventListener('DOMContentLoaded', () => {
    const slotsEls = document.querySelectorAll('.weekly-slot');
    if (!slotsEls.length) return; // If weekly planning not on page

    slotsEls.forEach(slot => {
        slot.addEventListener('dragover', e => {
            e.preventDefault();
            slot.classList.add('ring', 'ring-blue-400', 'ring-4');
        });
        slot.addEventListener('dragleave', () => {
            slot.classList.remove('ring', 'ring-blue-400', 'ring-4');
        });
        slot.addEventListener('drop', e => {
            e.preventDefault();
            slot.classList.remove('ring', 'ring-blue-400', 'ring-4');
            const actId = e.dataTransfer.getData('activity-id');
            const fromLevel = e.dataTransfer.getData('from-level');
            const fromDay = e.dataTransfer.getData('from-day');
            const fromSlot = e.dataTransfer.getData('from-slot');
            const toLevel = slot.getAttribute('data-level');
            const toDay = slot.getAttribute('data-day');
            const toSlot = slot.getAttribute('data-slot');
            if (!actId || !fromLevel || !fromDay || !fromSlot) return;
            moveWeeklyActivity(fromLevel, fromDay, fromSlot, toLevel, toDay, toSlot, actId);
        });
    });

    // Delegate dragstart for weekly activities
    document.addEventListener('dragstart', function (e) {
        if (e.target.classList && e.target.classList.contains('weekly-activity')) {
            const parentSlot = e.target.closest('.weekly-slot');
            if (!parentSlot) return;
            e.dataTransfer.setData('activity-id', e.target.getAttribute('data-id'));
            e.dataTransfer.setData('from-level', parentSlot.getAttribute('data-level'));
            e.dataTransfer.setData('from-day', parentSlot.getAttribute('data-day'));
            e.dataTransfer.setData('from-slot', parentSlot.getAttribute('data-slot'));
            e.dataTransfer.effectAllowed = 'move';
        }
    });

    // Load templates and announcements on init
    loadTemplatesList();
    loadAnnouncements();
    loadAvailabilityDisplay();

    // Initialize notification UI + preferences
    initNotificationUI();
    initNotificationPreferencesUI();

    // Setup offline data caching
    setupOfflineMode();

    // Setup student notes level selector
    const notesLevelSelect = document.getElementById('notes-level-select');
    if (notesLevelSelect) {
        notesLevelSelect.addEventListener('change', populateStudentSelector);
    }

    // AI Plan Assistant UI wiring (server-managed key; hide any key inputs)
    try {
        const keyInput = document.getElementById('gemini-api-key-input');
        const saveKeyBtn = document.getElementById('save-gemini-key-btn');
        const suggestBtn = document.getElementById('ai-suggest-plan-btn');
        const riskBtn = document.getElementById('ai-risk-briefing-btn');
        const clearPlanBtn = document.getElementById('clear-weekly-plan-btn');
        if (keyInput) { keyInput.value = 'Server-managed'; keyInput.disabled = true; keyInput.placeholder = 'No key needed'; }
        if (saveKeyBtn) { saveKeyBtn.classList.add('hidden'); }
        if (suggestBtn) suggestBtn.addEventListener('click', aiSuggestWeeklyPlan);
        if (riskBtn) riskBtn.addEventListener('click', aiGenerateRiskBriefing);
        if (clearPlanBtn) clearPlanBtn.addEventListener('click', clearAllWeeklyActivities);
    } catch (_) { }
});

// ==============================
// NEW FEATURES
// ==============================

// --- ANNOUNCEMENTS BOARD ---
function postAnnouncement() {
    const input = document.getElementById('announcement-input');
    const pinnedCheckbox = document.getElementById('announcement-pinned');
    const urgentCheckbox = document.getElementById('announcement-urgent');
    const text = input ? input.value.trim() : '';
    const pinned = pinnedCheckbox ? pinnedCheckbox.checked : false;
    const urgent = urgentCheckbox ? urgentCheckbox.checked : false;

    if (!text) {
        alert('Please enter an announcement');
        return;
    }

    const user = auth.currentUser;
    const userName = currentUserName || (user && user.email ? user.email.split('@')[0] : 'Instructor');

    db.ref('announcements').push({
        text,
        author: userName,
        authorId: user ? user.uid : 'anon',
        pinned,
        urgent,
        timestamp: Date.now(),
        views: {}
    }).then(() => {
        if (input) input.value = '';
        if (pinnedCheckbox) pinnedCheckbox.checked = false;
        if (urgentCheckbox) urgentCheckbox.checked = false;
        if (urgent && window.notificationPrefs.enabled && window.notificationPrefs.urgent) {
            if (window.notificationPrefs.own) {
                showNotification('Urgent Announcement', { body: text.slice(0,120) + (text.length>120?'...':'') });
            }
        }
        loadAnnouncements();
    }).catch(err => alert('Error posting announcement: ' + err.message));
}

// Removed remote broadcast function

function loadAnnouncements() {
    // Allow viewing announcements even if not yet approved (posting may still be permitted separately)
    // Removed hard gate on userApproved to ensure board always populates after login.
    const list = document.getElementById('announcements-list');
    if (!list) return;
    const user = auth.currentUser;
    const userId = user ? user.uid : null;
    // Detach previous listener
    if (announcementsListenerAttached) { db.ref('announcements').off(); announcementsListenerAttached = false; }
    db.ref('announcements').orderByChild('timestamp').on('value', snap => {
        list.innerHTML = '';
        const announcements = [];
        snap.forEach(child => { announcements.push({ id: child.key, ...child.val() }); });
        announcements.sort((a, b) => {
            if (a.pinned && !b.pinned) return -1;
            if (!a.pinned && b.pinned) return 1;
            return b.timestamp - a.timestamp;
        });
        if (!announcements.length) { list.innerHTML = '<div class="text-gray-500 text-center py-4">No announcements yet</div>'; return; }
        announcements.forEach(ann => {
            if (userId && ann.id && (!ann.views || !ann.views[userId])) { markAnnouncementViewed(ann.id, userId); }
            const div = document.createElement('div');
            const borderColor = ann.urgent ? 'border-2 border-red-400' : (ann.pinned ? 'border-2 border-yellow-400' : 'border border-gray-200');
            div.className = `bg-white rounded-lg p-4 shadow ${borderColor}`;
            const isOwner = user && ann.authorId === user.uid;
            const pinBtn = isOwner ? `<button onclick="togglePin('${ann.id}', ${!ann.pinned})" class="text-blue-600 hover:text-blue-800 text-sm ml-2">${ann.pinned ? 'Unpin' : 'Pin'}</button>` : '';
            const deleteBtn = isOwner ? `<button onclick="deleteAnnouncement('${ann.id}')" class="text-red-600 hover:text-red-800 text-sm ml-2">Delete</button>` : '';
            const viewCount = ann.views ? Object.keys(ann.views).length : 0;
            const viewsBtn = isOwner && viewCount > 0 ? `<button onclick="showAnnouncementViews('${ann.id}')" class="text-gray-600 hover:text-gray-800 text-xs ml-2">👁️ ${viewCount} view${viewCount !== 1 ? 's' : ''}</button>` : '';

            div.innerHTML = `
                <div class="flex justify-between items-start mb-2">
                    <div class="flex items-center gap-2 flex-wrap">
                        ${ann.urgent ? '<span class="text-red-600 font-bold">🔔 URGENT</span>' : ''}
                        ${ann.pinned ? '<span class="text-yellow-600 font-bold">📌 PINNED</span>' : ''}
                        <span class="text-xs text-gray-500">${new Date(ann.timestamp).toLocaleString()}</span>
                    </div>
                    <div class="flex items-center flex-wrap gap-1">
                        <span class="text-sm text-blue-700 font-semibold">${escapeHtml(ann.author)}</span>
                        ${viewsBtn}
                        ${pinBtn}
                        ${deleteBtn}
                    </div>
                </div>
                <p class="text-gray-800">${escapeHtml(ann.text)}</p>
            `;
            list.appendChild(div);
            // Local notification for recent urgent announcements (no duplicates)
            if (ann.urgent && window.notificationPrefs.enabled && window.notificationPrefs.urgent && typeof Notification !== 'undefined' && Notification.permission === 'granted') {
                const recent = Date.now() - ann.timestamp < 5 * 60 * 1000;
                const authorIsSelf = (user && ann.authorId === user.uid);
                if (recent && !window.__urgentNotifiedIds.has(ann.id) && (window.notificationPrefs.own || !authorIsSelf)) {
                    showNotification('Urgent Announcement', { body: ann.text.slice(0,120) + (ann.text.length>120?'...':'') });
                    window.__urgentNotifiedIds.add(ann.id);
                }
            }
        });
    });
    announcementsListenerAttached = true;
}

function markAnnouncementViewed(announcementId, userId) {
    db.ref(`announcements/${announcementId}/views/${userId}`).set({
        timestamp: Date.now(),
        userName: currentUserName || 'Unknown'
    });
}

function showAnnouncementViews(announcementId) {
    db.ref(`announcements/${announcementId}/views`).once('value').then(snap => {
        const views = snap.val() || {};
        const viewList = Object.values(views)
            .sort((a, b) => b.timestamp - a.timestamp)
            .map(v => `${v.userName || 'Unknown'} - ${new Date(v.timestamp).toLocaleString()}`)
            .join('\n');

        alert(`Viewed by (${Object.keys(views).length}):\n\n${viewList || 'No views yet'}`);
    });
}

window.postAnnouncement = postAnnouncement;
window.deleteAnnouncement = function (id) {
    if (confirm('Delete this announcement?')) {
        db.ref('announcements/' + id).remove().then(() => loadAnnouncements());
    }
};
window.togglePin = function (id, shouldPin) {
    db.ref('announcements/' + id).update({ pinned: shouldPin }).then(() => {
        loadAnnouncements();
    }).catch(err => {
        alert('Error updating pin status: ' + err.message);
    });
};

// Windy-related integrations removed from instructors page. Weather UI still present but uses cached/tides data.

// --- TIDE INFORMATION ---
async function fetchTideData() {
    const tideDiv = document.getElementById('tide-data');
    if (!tideDiv) return;

    try {
        // --- Safety timeout helpers ---
        const SERVERLESS_TIMEOUT_MS = 8000;
        const PROXY_TIMEOUT_MS = 8000;
        function withTimeout(promise, ms) {
            return Promise.race([
                promise,
                new Promise((_, reject) => setTimeout(() => reject(new Error('Timeout after ' + ms + 'ms')), ms))
            ]);
        }
        // Check cache first (cache for 1 hour)
        const cacheKey = 'tideData_' + new Date().toDateString();
        const cacheTimeKey = 'tideDataTime';
        const cached = localStorage.getItem(cacheKey);
        const cacheTime = localStorage.getItem(cacheTimeKey);
        const ONE_HOUR = 60 * 60 * 1000;

        if (cached && cacheTime && (Date.now() - parseInt(cacheTime) < ONE_HOUR)) {
            const data = JSON.parse(cached);
            renderTideData(data, tideDiv);
            return;
        }

        tideDiv.innerHTML = '<p class="text-sm animate-pulse">Loading tide data...</p>';

        // Try serverless function first (if deployed) with timeout
        try {
            const response = await withTimeout(fetch('/.netlify/functions/fetch-tides'), SERVERLESS_TIMEOUT_MS);
            if (response.ok) {
                const result = await response.json();
                if (result.success && result.tides && result.tides.length > 0) {
                    localStorage.setItem(cacheKey, JSON.stringify(result));
                    localStorage.setItem(cacheTimeKey, Date.now().toString());
                    renderTideData(result, tideDiv);
                    return;
                }
            }
        } catch (fnError) {
            // Serverless function unavailable or timed out
        }

        // Fallback: Use CORS proxy
        // Trying CORS proxy
        const corsProxy = 'https://api.allorigins.win/raw?url=';
        const tideUrl = encodeURIComponent('https://tidesnear.me/tide_stations/3459');
        const proxyResponse = await withTimeout(fetch(corsProxy + tideUrl), PROXY_TIMEOUT_MS);
        const html = await proxyResponse.text();

        const tideData = parseTideHTML(html);

        if (tideData.tides.length > 0) {
            localStorage.setItem(cacheKey, JSON.stringify(tideData));
            localStorage.setItem(cacheTimeKey, Date.now().toString());
            renderTideData(tideData, tideDiv);
        } else {
            throw new Error('No tide data parsed');
        }

    } catch (error) {
        console.error('Tide fetch error:', error);
        // Fallback to approximate calculation
        const tideData = calculateApproximateTides();
        tideData.note = 'Approximate (live fetch error)';
        renderTideData(tideData, tideDiv);
    }

    // Final safeguard: if still showing loading state, force approximate fallback
    if (tideDiv.innerText && /Loading tide data/i.test(tideDiv.innerText)) {
        const fallback = calculateApproximateTides();
        fallback.note = 'Approximate (live unavailable)';
        renderTideData(fallback, tideDiv);
    }
} // <-- This closes fetchTideData
// Add this closing brace to properly end fetchTideData
// (FIX: Added missing closing brace for fetchTideData)

function parseTideHTML(html) {
    const tides = [];

    // Multiple parsing strategies for tidesnear.me

    // Strategy 1: Look for JSON data in script tags (multiple patterns)
    const jsonPatterns = [
        /var\s+tideData\s*=\s*(\[[\s\S]*?\]);/,
        /const\s+tideData\s*=\s*(\[[\s\S]*?\]);/,
        /"tides"\s*:\s*(\[[\s\S]*?\])/
    ];

    for (const pattern of jsonPatterns) {
        const jsonMatch = html.match(pattern);
        if (jsonMatch) {
            try {
                const data = JSON.parse(jsonMatch[1]);
                return { tides: data, station: 'Rathmullan, Lough Swilly', note: 'Live data from TidesNearMe' };
            } catch (e) {
                // JSON parse failed, try HTML parsing
            }
        }
    }

    // Strategy 2: More flexible HTML parsing
    // Look for common patterns in tide websites
    const patterns = [
        // Pattern 1: High/Low with time and optional height
        /(High|Low)\s*(?:Tide)?\s*[:\-]?\s*(\d{1,2}):(\d{2})\s*(AM|PM)/gi,
        // Pattern 2: Time followed by High/Low
        /(\d{1,2}):(\d{2})\s*(AM|PM)\s*[:\-]?\s*(High|Low)/gi
    ];

    let matches = [];

    for (const pattern of patterns) {
        const regex = new RegExp(pattern);
        let match;
        while ((match = regex.exec(html)) !== null) {
            let type, hour, minute, meridiem;

            // Check which pattern matched
            if (match[1] && (match[1].toLowerCase() === 'high' || match[1].toLowerCase() === 'low')) {
                // Pattern 1: High/Low first
                type = match[1].toLowerCase();
                hour = parseInt(match[2]);
                minute = parseInt(match[3]);
                meridiem = match[4].toUpperCase();
            } else if (match[4] && (match[4].toLowerCase() === 'high' || match[4].toLowerCase() === 'low')) {
                // Pattern 2: Time first
                hour = parseInt(match[1]);
                minute = parseInt(match[2]);
                meridiem = match[3].toUpperCase();
                type = match[4].toLowerCase();
            } else {
                continue;
            }

            // Convert to 24-hour
            if (meridiem === 'PM' && hour !== 12) hour += 12;
            if (meridiem === 'AM' && hour === 12) hour = 0;

            const now = new Date();
            const tideTime = new Date(now);
            tideTime.setHours(hour, minute, 0, 0);

            matches.push({
                time: tideTime,
                type,
                height: null // Will try to extract separately
            });
        }

        if (matches.length > 0) {
            break;
        }
    }

    // Try to extract heights separately if we have times
    if (matches.length > 0) {
        const heightPattern = /(\d+\.?\d*)\s*(?:m|meters|metres|ft|feet)/gi;
        const heights = [];
        let heightMatch;
        while ((heightMatch = heightPattern.exec(html)) !== null) {
            heights.push(parseFloat(heightMatch[1]));
        }


        // Match heights to tides (assuming order matches)
        matches.forEach((tide, i) => {
            if (heights[i]) tide.height = heights[i];
        });
    }    tides.push(...matches);

    // Total tides parsed: removed log

    return {
        tides,
        station: 'Rathmullan, Lough Swilly',
        note: tides.length > 0 ? 'Live data from TidesNearMe' : 'Approximate data'
    };
}

function calculateApproximateTides() {
    // Simplified tide calculation (actual tides would come from API)
    const now = new Date();
    const day = now.getDate();
    const hour = now.getHours();

    // Approximate 6-hour cycle for semi-diurnal tides
    const highTide1 = new Date(now);
    highTide1.setHours(6, 30, 0);
    const lowTide1 = new Date(now);
    lowTide1.setHours(0, 45, 0);
    const highTide2 = new Date(now);
    highTide2.setHours(18, 45, 0);
    const lowTide2 = new Date(now);
    lowTide2.setHours(12, 30, 0);

    return {
        tides: [
            { time: lowTide1, type: 'low', height: 0.8 },
            { time: highTide1, type: 'high', height: 4.2 },
            { time: lowTide2, type: 'low', height: 0.6 },
            { time: highTide2, type: 'high', height: 4.5 }
        ],
        station: 'Rathmullan (Approximate)',
        note: 'Approximate times - verify with official sources'
    };
}

function renderTideData(data, container) {
    const now = new Date();
    let html = '<div class="space-y-2">';

    // Sort tides by time
    const sortedTides = [...data.tides].sort((a, b) => new Date(a.time) - new Date(b.time));

    // Find next tide
    let nextTide = null;
    for (const tide of sortedTides) {
        if (new Date(tide.time) > now) {
            nextTide = tide;
            break;
        }
    }

    if (nextTide) {
        const timeStr = new Date(nextTide.time).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
        const icon = nextTide.type === 'high' ? '⬆️' : '⬇️';
        html += `<div class="font-bold text-lg">${icon} Next: ${nextTide.type.toUpperCase()} at ${timeStr}</div>`;
        if (nextTide.height) {
            html += `<div class="text-sm opacity-90">Height: ${nextTide.height}m</div>`;
        }
    }

    html += '<div class="mt-3 space-y-1 text-xs opacity-75">';
    html += `<div class="font-semibold mb-1">${data.station || 'Rathmullan'}</div>`;
    sortedTides.forEach(tide => {
        const timeStr = new Date(tide.time).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
        const icon = tide.type === 'high' ? '⬆️' : '⬇️';
        const heightStr = tide.height ? ` (${tide.height}m)` : '';
        html += `<div>${icon} ${tide.type}: ${timeStr}${heightStr}</div>`;
    });
    html += '</div>';

    if (data.note) {
        html += `<div class="mt-2 text-[10px] opacity-60">${data.note}</div>`;
    }

    html += '</div>';
    container.innerHTML = html;
}

// --- WEATHER ALERTS ---
let dismissedAlerts = new Set();

function checkWeatherAlerts(weatherData) {
    if (!weatherData || !weatherData.current) return;

    const wind = weatherData.current.wind;
    const alerts = [];

    // Check wind conditions
    if (wind && wind.knots > 25) {
        alerts.push({
            level: 'danger',
            message: `Strong winds: ${wind.knots} knots (${wind.bft}). Consider canceling sailing activities.`
        });
    } else if (wind && wind.knots > 20) {
        alerts.push({
            level: 'warning',
            message: `High winds: ${wind.knots} knots (${wind.bft}). Exercise caution with beginner levels.`
        });
    }

    // Check gusts
    if (wind && wind.gustKnots > 30) {
        alerts.push({
            level: 'danger',
            message: `Strong gusts forecast: ${wind.gustKnots} knots. High risk conditions.`
        });
    }

    // Show alert if not dismissed
    if (alerts.length > 0) {
        const alertKey = alerts[0].message;
        if (!dismissedAlerts.has(alertKey)) {
            showWeatherAlert(alerts[0]);

            // Show simple local notification for danger level if permitted
            if (alerts[0].level === 'danger' && window.notificationPrefs.enabled && window.notificationPrefs.weather && typeof Notification !== 'undefined' && Notification.permission === 'granted') {
                showNotification('Weather Alert', { body: alerts[0].message });
            }
        }
    }
}

function showWeatherAlert(alert) {
    const alertDiv = document.getElementById('weather-alert');
    const alertText = document.getElementById('weather-alert-text');

    if (alertDiv && alertText) {
        alertText.textContent = alert.message;
        alertDiv.classList.remove('hidden');
    }
}

function dismissWeatherAlert() {
    const alertDiv = document.getElementById('weather-alert');
    const alertText = document.getElementById('weather-alert-text');

    if (alertDiv && alertText) {
        dismissedAlerts.add(alertText.textContent);
        alertDiv.classList.add('hidden');
    }
}

window.dismissWeatherAlert = dismissWeatherAlert;
window.showAnnouncementViews = showAnnouncementViews;

// --- OFFLINE MODE SETUP ---
function setupOfflineMode() {
    // Cache critical data in localStorage
    const criticalPaths = [
        'announcements',
        'students',
        'weeklyPlan'
    ];

    criticalPaths.forEach(path => {
        db.ref(path).on('value', snap => {
            if (isOnline) {
                try {
                    localStorage.setItem(`offline_${path.replace(/\//g, '_')}`, JSON.stringify(snap.val()));
                } catch (e) {
                    console.warn('Failed to cache data:', path, e);
                }
            }
        });
    });

    // If offline, load from cache
    if (!isOnline) {
        loadOfflineData();
    }
}

function loadOfflineData() {
    // Load cached announcements
    const cachedAnnouncements = localStorage.getItem('offline_announcements');
    if (cachedAnnouncements) {
        try {
            const data = JSON.parse(cachedAnnouncements);
            // Render using cached data if rendering logic exists elsewhere
        } catch (e) {
            console.error('Error loading offline announcements:', e);
        }
    }
}

// --- INSTRUCTOR AVAILABILITY ---
function setAvailabilityRange() {
    const startInput = document.getElementById('availability-start-date');
    const endInput = document.getElementById('availability-end-date');
    const statusSelect = document.getElementById('availability-status');

    const startDate = startInput ? startInput.value : '';
    const endDate = endInput ? endInput.value : startDate;
    const status = statusSelect ? statusSelect.value : 'available';

    if (!startDate) {
        alert('Please select a start date');
        return;
    }

    const user = auth.currentUser;
    if (!user) return;

    // Generate all dates in range
    const dates = [];
    const current = new Date(startDate);
    const end = new Date(endDate || startDate);

    while (current <= end) {
        dates.push(current.toISOString().split('T')[0]);
        current.setDate(current.getDate() + 1);
    }

    // Set availability for all dates in range
    const updates = {};
    dates.forEach(date => {
        updates[`availability/${user.uid}/${date}`] = {
            status,
            name: currentUserName || user.email.split('@')[0],
            timestamp: Date.now()
        };
    });

    db.ref().update(updates).then(() => {
        alert(`Availability set for ${dates.length} day(s)`);
        loadAvailabilityDisplay();
        if (startInput) startInput.value = '';
        if (endInput) endInput.value = '';
    }).catch(err => alert('Error: ' + err.message));
}

function clearMyAvailability() {
    if (!confirm('Clear all your availability entries?')) return;

    const user = auth.currentUser;
    if (!user) return;

    db.ref(`availability/${user.uid}`).remove().then(() => {
        alert('Your availability has been cleared');
        loadAvailabilityDisplay();
    }).catch(err => alert('Error: ' + err.message));
}

// Track current calendar month offset (0 = current month)
let calendarMonthOffset = 0;

function loadAvailabilityDisplay() {
    const calendarDiv = document.getElementById('availability-calendar');
    const listDiv = document.getElementById('availability-list');
    if (!calendarDiv || !listDiv) return;

    db.ref('availability').once('value').then(snap => {
        const allAvailability = {};
        const userAvailability = {};

        snap.forEach(userSnap => {
            const userId = userSnap.key;
            userSnap.forEach(dateSnap => {
                const date = dateSnap.key;
                const data = dateSnap.val();

                // Group by date
                if (!allAvailability[date]) allAvailability[date] = [];
                allAvailability[date].push(data);

                // Group by user
                if (!userAvailability[data.name]) userAvailability[data.name] = { available: [], unavailable: [] };
                if (data.status === 'available') {
                    userAvailability[data.name].available.push(date);
                } else {
                    userAvailability[data.name].unavailable.push(date);
                }
            });
        });

        // Render Calendar View
        renderCalendarView(calendarDiv, allAvailability);

        // Render List View
        renderListView(listDiv, userAvailability);
    });
}

function renderCalendarView(container, allAvailability) {
    // Calculate the month to display based on offset
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const displayDate = new Date(today.getFullYear(), today.getMonth() + calendarMonthOffset, 1);

    // Update month display
    const monthDisplay = document.getElementById('calendar-month-display');
    if (monthDisplay) {
        monthDisplay.textContent = displayDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
    }

    // Get all days in the display month
    const year = displayDate.getFullYear();
    const month = displayDate.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();

    // Get day of week for first day (0 = Sunday, 1 = Monday, etc.)
    const firstDayOfWeek = firstDay.getDay();

    const dates = [];
    // Add padding days from previous month
    for (let i = firstDayOfWeek - 1; i >= 0; i--) {
        const date = new Date(year, month, -i);
        dates.push({ date, isCurrentMonth: false });
    }
    // Add days of current month
    for (let i = 1; i <= daysInMonth; i++) {
        const date = new Date(year, month, i);
        dates.push({ date, isCurrentMonth: true });
    }
    // Add padding days from next month to complete the grid
    const remainingCells = 7 - (dates.length % 7);
    if (remainingCells < 7) {
        for (let i = 1; i <= remainingCells; i++) {
            const date = new Date(year, month + 1, i);
            dates.push({ date, isCurrentMonth: false });
        }
    }

    // Day of week headers
    let html = '<div class="grid grid-cols-7 gap-2 mb-2">';
    ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].forEach(day => {
        html += `<div class="text-center text-xs font-semibold text-gray-600 py-1">${day}</div>`;
    });
    html += '</div>';

    // Calendar grid

    html += '<div class="grid grid-cols-7 gap-2">';

    dates.forEach(({ date: dateObj, isCurrentMonth }) => {
        const dateStr = dateObj.toISOString().split('T')[0];
        const dayData = allAvailability[dateStr] || [];
        const availableCount = dayData.filter(d => d.status === 'available').length;
        const unavailableCount = dayData.filter(d => d.status === 'unavailable').length;

        const isToday = dateObj.toDateString() === new Date().toDateString();
        const dayNum = dateObj.getDate();

        let bgColor = 'bg-white';
        if (availableCount > 0 && unavailableCount === 0) bgColor = 'bg-green-100';
        else if (availableCount > 0) bgColor = 'bg-yellow-100';
        else if (unavailableCount > 0) bgColor = 'bg-red-100';

        const opacity = isCurrentMonth ? '' : 'opacity-30';

        html += `
            <div class="${bgColor} ${opacity} border ${isToday ? 'border-blue-500 border-2' : 'border-gray-300'} rounded-lg p-2 text-center hover:shadow-md transition-shadow cursor-pointer" onclick="showAvailabilityPicker('${dateStr}')">
                <div class="text-lg font-bold ${isToday ? 'text-blue-600' : 'text-gray-800'}">${dayNum}</div>
                ${availableCount > 0 ? `<div class="text-xs text-green-700">✅${availableCount}</div>` : ''}
                ${unavailableCount > 0 ? `<div class="text-xs text-red-700">❌${unavailableCount}</div>` : ''}
            </div>
        `;
    });

    html += '</div>';
    container.innerHTML = html;
}

function renderListView(container, userAvailability) {
    if (Object.keys(userAvailability).length === 0) {
        container.innerHTML = '<div class="text-center text-gray-500 py-4">No availability set yet</div>';
        return;
    }

    let html = '<div class="space-y-3">';

    Object.keys(userAvailability).sort().forEach(name => {
        const data = userAvailability[name];
        const availDates = data.available.sort();
        const unavailDates = data.unavailable.sort();

        html += `
            <div class="bg-white border border-gray-200 rounded-lg p-3">
                <div class="font-semibold text-gray-800 mb-2">${escapeHtml(name)}</div>
                ${availDates.length > 0 ? `
                    <div class="mb-1">
                        <span class="text-xs font-medium text-green-700">✅ Available:</span>
                        <span class="text-xs text-gray-600">${formatDateRange(availDates)}</span>
                    </div>
                ` : ''}
                ${unavailDates.length > 0 ? `
                    <div>
                        <span class="text-xs font-medium text-red-700">❌ Unavailable:</span>
                        <span class="text-xs text-gray-600">${formatDateRange(unavailDates)}</span>
                    </div>
                ` : ''}
            </div>
        `;
    });

    html += '</div>';
    container.innerHTML = html;
}

function formatDateRange(dates) {
    if (dates.length === 0) return '';
    if (dates.length === 1) return formatDate(dates[0]);

    // Group consecutive dates into ranges
    const ranges = [];
    let rangeStart = dates[0];
    let rangeEnd = dates[0];

    for (let i = 1; i < dates.length; i++) {
        const prevDate = new Date(dates[i - 1]);
        const currDate = new Date(dates[i]);
        const diffDays = Math.round((currDate - prevDate) / (1000 * 60 * 60 * 24));

        if (diffDays === 1) {
            rangeEnd = dates[i];
        } else {
            ranges.push(rangeStart === rangeEnd ? formatDate(rangeStart) : `${formatDate(rangeStart)} - ${formatDate(rangeEnd)}`);
            rangeStart = dates[i];
            rangeEnd = dates[i];
        }
    }
    ranges.push(rangeStart === rangeEnd ? formatDate(rangeStart) : `${formatDate(rangeStart)} - ${formatDate(rangeEnd)}`);

    return ranges.join(', ');
}

function formatDate(dateStr) {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

function showDayDetails(dateStr) {
    db.ref('availability').once('value').then(snap => {
        const dayData = [];
        snap.forEach(userSnap => {
            const data = userSnap.child(dateStr).val();
            if (data) dayData.push(data);
        });

        if (dayData.length === 0) {
            alert('No availability set for this day');
            return;
        }

        const date = new Date(dateStr);
        const formattedDate = date.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });

        const available = dayData.filter(d => d.status === 'available').map(d => d.name).sort();
        const unavailable = dayData.filter(d => d.status === 'unavailable').map(d => d.name).sort();

        let message = `📅 ${formattedDate}\n\n`;
        if (available.length > 0) message += `✅ Available (${available.length}):\n${available.join(', ')}\n\n`;
        if (unavailable.length > 0) message += `❌ Unavailable (${unavailable.length}):\n${unavailable.join(', ')}`;

        alert(message);
    });
}

// Show a small modal allowing the current user to mark available/unavailable/clear for a date
function showAvailabilityPicker(dateStr) {
    const user = auth.currentUser;
    if (!user) return alert('Please sign in to set your availability');

    // Fetch day's availability summary and user's own entry
    Promise.all([
        db.ref('availability').orderByKey().once('value'),
        db.ref(`availability/${user.uid}/${dateStr}`).once('value')
    ]).then(([allSnap, mySnap]) => {
        const dayData = [];
        allSnap.forEach(userSnap => {
            const data = userSnap.child(dateStr).val();
            if (data) dayData.push(data);
        });

        const myEntry = mySnap.exists() ? mySnap.val() : null;
        const date = new Date(dateStr);
        const formattedDate = date.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });

        // Build modal
        const modal = document.createElement('div');
        modal.id = 'availability-modal';
        modal.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50';

        const available = dayData.filter(d => d.status === 'available').map(d => d.name).sort();
        const unavailable = dayData.filter(d => d.status === 'unavailable').map(d => d.name).sort();
        let summaryHtml = '';
        if (available.length > 0) summaryHtml += `✅ Available (${available.length}): ${available.join(', ')}\n`;
        if (unavailable.length > 0) summaryHtml += `❌ Unavailable (${unavailable.length}): ${unavailable.join(', ')}`;

        const box = document.createElement('div');
        box.className = 'bg-white rounded-lg shadow-lg p-6 w-full max-w-md';
        box.innerHTML = `
            <div class="text-lg font-semibold mb-2">Availability — ${escapeHtml(formattedDate)}</div>
            <div id="availability-summary" class="text-sm text-gray-600 mb-3 white-space-pre-wrap">${escapeHtml(summaryHtml) || 'No availability set for this date.'}</div>
            <div id="my-status" class="text-sm text-gray-800 mb-4">${myEntry ? 'You are marked: ' + escapeHtml(myEntry.status) : 'You have no entry for this date.'}</div>
            <div class="grid grid-cols-3 gap-3 mb-3">
                <button id="avail-btn" class="bg-green-600 hover:bg-green-700 text-white px-3 py-2 rounded">Available</button>
                <button id="unavail-btn" class="bg-red-600 hover:bg-red-700 text-white px-3 py-2 rounded">Unavailable</button>
                <button id="clear-btn" class="bg-gray-200 hover:bg-gray-300 text-gray-800 px-3 py-2 rounded">Clear</button>
            </div>
            <button id="cancel-btn" class="w-full mt-2 bg-white border border-gray-200 rounded py-2 hover:bg-gray-50">Cancel</button>
        `;

        modal.appendChild(box);
        document.body.appendChild(modal);

        // Handlers
        const availBtnEl = document.getElementById('avail-btn');
        const unavailBtnEl = document.getElementById('unavail-btn');
        const clearBtnEl = document.getElementById('clear-btn');
        const cancelBtnEl = document.getElementById('cancel-btn');

        const cleanup = () => {
            try { document.body.removeChild(modal); } catch (_) {}
            window.removeEventListener('keydown', onKey);
        };

        const onKey = (e) => { if (e.key === 'Escape') cleanup(); };
        window.addEventListener('keydown', onKey);

        availBtnEl.onclick = () => {
            const name = currentUserName || (user.email ? user.email.split('@')[0] : 'User');
            db.ref(`availability/${user.uid}/${dateStr}`).set({ status: 'available', name, timestamp: Date.now() })
                .then(() => { cleanup(); loadAvailabilityDisplay(); alert('Marked available'); })
                .catch(err => alert('Error: ' + err.message));
        };

        unavailBtnEl.onclick = () => {
            const name = currentUserName || (user.email ? user.email.split('@')[0] : 'User');
            db.ref(`availability/${user.uid}/${dateStr}`).set({ status: 'unavailable', name, timestamp: Date.now() })
                .then(() => { cleanup(); loadAvailabilityDisplay(); alert('Marked unavailable'); })
                .catch(err => alert('Error: ' + err.message));
        };

        clearBtnEl.onclick = () => {
            if (!confirm('Clear your availability entry for this date?')) return;
            db.ref(`availability/${user.uid}/${dateStr}`).remove()
                .then(() => { cleanup(); loadAvailabilityDisplay(); alert('Availability cleared'); })
                .catch(err => alert('Error: ' + err.message));
        };

        cancelBtnEl.onclick = () => cleanup();
    }).catch(err => {
        console.error('Failed to load availability for picker', err);
        alert('Could not load availability data');
    });
}

function changeCalendarMonth(offset) {
    calendarMonthOffset += offset;
    loadAvailabilityDisplay();
}

function resetCalendarToToday() {
    calendarMonthOffset = 0;
    loadAvailabilityDisplay();
}

window.setAvailabilityRange = setAvailabilityRange;
window.clearMyAvailability = clearMyAvailability;
window.showDayDetails = showDayDetails;
window.showAvailabilityPicker = showAvailabilityPicker;
window.changeCalendarMonth = changeCalendarMonth;
window.resetCalendarToToday = resetCalendarToToday;

// --- STUDENT NOTES ---
function populateStudentSelector() {
    const levelSelect = document.getElementById('notes-level-select');
    const studentSelect = document.getElementById('notes-student-select');
    const loadBtn = document.getElementById('load-notes-btn');

    if (!levelSelect || !studentSelect || !loadBtn) return;

    const level = levelSelect.value;
    if (!level) {
        studentSelect.disabled = true;
        loadBtn.disabled = true;
        return;
    }

    db.ref('students/' + level).once('value').then(snap => {
        const students = snap.val() || [];
        studentSelect.innerHTML = '<option value="">Select student...</option>';
        students.forEach(student => {
            const option = document.createElement('option');
            option.value = student.id;
            option.textContent = student.name;
            studentSelect.appendChild(option);
        });
        studentSelect.disabled = false;
        loadBtn.disabled = false;
    });
}

function loadStudentNotes() {
    const levelSelect = document.getElementById('notes-level-select');
    const studentSelect = document.getElementById('notes-student-select');
    const display = document.getElementById('student-notes-display');
    const skillsDisplay = document.getElementById('student-skills-display');
    const nameEl = document.getElementById('notes-student-name');
    const historyEl = document.getElementById('notes-history');

    if (!levelSelect || !studentSelect || !display || !nameEl || !historyEl) return;

    const level = levelSelect.value;
    const studentId = studentSelect.value;
    const studentName = studentSelect.options[studentSelect.selectedIndex].text;

    if (!level || !studentId) {
        alert('Please select level and student');
        return;
    }

    // Show both notes and skills displays, and switch to notes tab
    display.classList.remove('hidden');
    skillsDisplay?.classList.add('hidden');
    nameEl.textContent = `Notes for: ${studentName}`;

    // Activate notes tab styling
    const notesBtn = document.getElementById('tab-notes-btn');
    const skillsBtn = document.getElementById('tab-skills-btn');
    if (notesBtn && skillsBtn) {
        notesBtn.classList.add('border-b-2', 'border-blue-600', 'text-blue-600');
        notesBtn.classList.remove('border-transparent', 'text-gray-600');
        skillsBtn.classList.remove('border-b-2', 'border-blue-600', 'text-blue-600');
        skillsBtn.classList.add('border-transparent', 'text-gray-600');
    }

    const studentPath = `studentNotes/${level}/${studentId}`;
    Promise.all([
        db.ref(studentPath).orderByChild('timestamp').once('value'),
        db.ref(studentPath + '/notes').orderByChild('timestamp').once('value')
    ]).then(([rootSnap, nestedSnap]) => {
        historyEl.innerHTML = '';
        const notes = [];

        // Collect direct children notes (skip the 'notes' container itself and skillsChecklist)
        rootSnap.forEach(child => {
            if (child.key === 'notes' || child.key === 'skillsChecklist') return;
            const val = child.val();
            if (val && typeof val === 'object' && val.text && Number.isFinite(val.timestamp)) {
                notes.push({ id: child.key, __path: `${studentPath}/${child.key}`, ...val });
            }
        });

        // Collect nested 'notes' children if present
        if (nestedSnap && nestedSnap.exists()) {
            nestedSnap.forEach(child => {
                const val = child.val();
                if (val && typeof val === 'object' && val.text && Number.isFinite(val.timestamp)) {
                    notes.push({ id: child.key, __path: `${studentPath}/notes/${child.key}`, ...val });
                }
            });
        }

        // Sort desc by timestamp when available
        notes.sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0));

        if (!notes.length) {
            historyEl.innerHTML = '<div class="text-gray-500 text-sm">No notes yet for this student</div>';
            return;
        }

        const user = auth.currentUser;
        const myUid = user ? user.uid : null;
        notes.forEach(note => {
            const div = document.createElement('div');
            div.className = 'bg-gray-50 border border-gray-200 rounded p-2 text-sm';
            const canEdit = !!myUid && (note.authorId ? note.authorId === myUid : (note.author === (currentUserName || (user && user.email ? user.email.split('@')[0] : ''))));
            const editedTag = note.editedAt ? '<span class="text-[10px] text-gray-400 ml-1">(edited)</span>' : '';
            const pathForAttr = (note.__path || `${studentPath}/${note.id}`).replace(/'/g, "\\'");
            const actions = canEdit ? `
                <div class="flex gap-2">
                    <button type="button" onclick="editStudentNote('${pathForAttr}', '${escapeHtml(note.text).replace(/'/g, "\\'")}', this)" class="px-2 py-0.5 rounded bg-blue-600 text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-300">Edit</button>
                    <button type="button" onclick="deleteStudentNote('${pathForAttr}')" class="px-2 py-0.5 rounded bg-red-600 text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-300">Delete</button>
                </div>
            ` : '';
            div.innerHTML = `
                <div class="flex items-start justify-between mb-1">
                    <div class="text-xs text-gray-500">${new Date(note.timestamp).toLocaleString()}</div>
                    <div class="flex items-center gap-2">
                        <span class="text-xs text-blue-600">${escapeHtml(note.author || 'Instructor')}</span>
                        ${actions}
                    </div>
                </div>
                <p class="text-gray-800">${escapeHtml(note.text)} ${editedTag}</p>
            `;
            historyEl.appendChild(div);
        });
    });
}

function saveStudentNote() {
    const levelSelect = document.getElementById('notes-level-select');
    const studentSelect = document.getElementById('notes-student-select');
    const input = document.getElementById('notes-input');

    if (!levelSelect || !studentSelect || !input) return;

    const level = levelSelect.value;
    const studentId = studentSelect.value;
    const text = input.value.trim();

    if (!level || !studentId || !text) {
        alert('Please fill in all fields');
        return;
    }

    const user = auth.currentUser;
    const userName = currentUserName || (user && user.email ? user.email.split('@')[0] : 'Instructor');
    const authorId = user ? user.uid : null;

    db.ref(`studentNotes/${level}/${studentId}`).push({
        text,
        author: userName,
        authorId: authorId,
        timestamp: Date.now()
    }).then(() => {
        input.value = '';
        loadStudentNotes();
        alert('Note saved!');
    }).catch(err => alert('Error: ' + err.message));
}

window.loadStudentNotes = loadStudentNotes;
window.saveStudentNote = saveStudentNote;

// Edit a student note
window.editStudentNote = function(notePath, currentText, buttonElement) {
    const newText = prompt('Edit note:', currentText);
    if (newText === null || newText.trim() === '') return;

    db.ref(notePath).update({
        text: newText.trim(),
        editedAt: Date.now()
    }).then(() => {
        loadStudentNotes();
    }).catch(err => alert('Error updating note: ' + err.message));
};

// Delete a student note
window.deleteStudentNote = function(notePath) {
    if (!confirm('Are you sure you want to delete this note?')) return;

    db.ref(notePath).remove().then(() => {
        loadStudentNotes();
    }).catch(err => alert('Error deleting note: ' + err.message));
};

// --- SKILLS CHECKLIST FUNCTIONS ---
function switchStudentTab(tab) {
    const notesDisplay = document.getElementById('student-notes-display');
    const skillsDisplay = document.getElementById('student-skills-display');
    const notesBtn = document.getElementById('tab-notes-btn');
    const skillsBtn = document.getElementById('tab-skills-btn');

    if (tab === 'notes') {
        notesDisplay?.classList.remove('hidden');
        skillsDisplay?.classList.add('hidden');
        notesBtn?.classList.add('border-b-2', 'border-blue-600', 'text-blue-600');
        skillsBtn?.classList.remove('border-b-2', 'border-blue-600', 'text-blue-600');
        skillsBtn?.classList.add('border-transparent', 'text-gray-600');
    } else if (tab === 'skills') {
        notesDisplay?.classList.add('hidden');
        skillsDisplay?.classList.remove('hidden');
        notesBtn?.classList.remove('border-b-2', 'border-blue-600', 'text-blue-600');
        notesBtn?.classList.add('border-transparent', 'text-gray-600');
        skillsBtn?.classList.add('border-b-2', 'border-blue-600', 'text-blue-600');
        skillsBtn?.classList.remove('border-transparent', 'text-gray-600');
        // Load skills when switching to this tab
        loadStudentSkillsChecklist();
    }
}

function loadStudentSkillsChecklist() {
    const levelSelect = document.getElementById('notes-level-select');
    const studentSelect = document.getElementById('notes-student-select');
    const skillsDisplay = document.getElementById('student-skills-display');
    const nameEl = document.getElementById('skills-student-name');
    const checklistContainer = document.getElementById('skills-checklist-container');

    if (!levelSelect || !studentSelect || !skillsDisplay || !nameEl || !checklistContainer) return;

    const level = levelSelect.value;
    const studentId = studentSelect.value;
    const studentName = studentSelect.options[studentSelect.selectedIndex].text;

    if (!level || !studentId) {
        alert('Please select level and student');
        return;
    }

    // Get the skills for this level
    const levelKey = level; // use the level code directly (e.g., 'taste-of-sailing')
    const skillsData = SAILING_SKILLS[levelKey];

    if (!skillsData) {
        checklistContainer.innerHTML = '<p class="text-red-600">Skills data not found for this level</p>';
        return;
    }

    skillsDisplay.classList.remove('hidden');
    nameEl.textContent = `Skills Checklist for ${studentName} - ${skillsData.level}`;

    // Fetch existing assessment data from database
    const skillsPath = `studentNotes/${level}/${studentId}/skillsChecklist`;
    db.ref(skillsPath).once('value').then(snap => {
        const assessments = snap.val() || {};

        // State indicators with emoji
        const stateEmojis = {
            'not_assessed': '🔵',
            'not_demonstrated': '❌',
            'partially_achieved': '⚠️',
            'achieved': '✅'
        };

        // Build the checklist HTML
        let html = '';

        // Check if this level has sections or flat competencies (for backward compatibility)
        if (skillsData.sections && Array.isArray(skillsData.sections)) {
            // New section-based structure
            skillsData.sections.forEach((section, sectionIndex) => {
                const sectionId = `section-${sectionIndex}`;
                // Default to collapsed unless localStorage explicitly says expanded
                const isExpanded = localStorage.getItem(`${levelKey}-${sectionId}-expanded`) === 'true';
                const isCollapsed = !isExpanded;

                html += `
                    <div class="border border-gray-300 rounded overflow-hidden bg-white">
                        <div class="bg-blue-100 border-b border-gray-300 p-3 cursor-pointer hover:bg-blue-200 transition flex items-center justify-between"
                            onclick="toggleSection('${sectionId}', '${levelKey}')">
                            <h4 class="font-semibold text-blue-800">${escapeHtml(section.name)}</h4>
                            <span id="${sectionId}-toggle" class="text-lg">
                                ${isCollapsed ? '▶️' : '▼'}
                            </span>
                        </div>
                        <div id="${sectionId}" class="space-y-3 p-3 ${isCollapsed ? 'hidden' : ''}">
                `;

                section.competencies.forEach(competency => {
                    const skillId = competency.id;
                    const currentState = assessments[skillId] || 'not_assessed';
                    const displayState = SKILL_ASSESSMENT_STATES[currentState] || 'Not Yet Assessed';
                    const emoji = stateEmojis[currentState] || '🔵';

                    html += `
                        <div class="border border-gray-200 rounded p-3 bg-white hover:bg-gray-50 transition">
                            <div class="flex items-start justify-between gap-2">
                                <div class="flex-grow">
                                    <p class="text-sm font-medium text-gray-800">${escapeHtml(competency.skill)}</p>
                                    <p class="text-xs text-gray-500 mt-1">ID: ${skillId}</p>
                                </div>
                                <button onclick="cycleSkillState('${levelKey}', '${studentId}', '${skillId}')"
                                    class="px-3 py-1 rounded font-semibold text-sm whitespace-nowrap cursor-pointer transition hover:shadow-md"
                                    id="skill-btn-${skillId}"
                                    data-state="${currentState}"
                                    data-skill-id="${skillId}">
                                    ${emoji} ${displayState}
                                </button>
                            </div>
                        </div>
                    `;
                });

                html += `
                        </div>
                    </div>
                `;
            });
        } else if (skillsData.competencies && Array.isArray(skillsData.competencies)) {
            // Legacy flat competencies structure
            skillsData.competencies.forEach(competency => {
                const skillId = competency.id;
                const currentState = assessments[skillId] || 'not_assessed';
                const displayState = SKILL_ASSESSMENT_STATES[currentState] || 'Not Yet Assessed';
                const emoji = stateEmojis[currentState] || '🔵';

                html += `
                    <div class="border border-gray-200 rounded p-3 bg-white hover:bg-gray-50 transition">
                        <div class="flex items-start justify-between gap-2">
                            <div class="flex-grow">
                                <p class="text-sm font-medium text-gray-800">${escapeHtml(competency.skill)}</p>
                                <p class="text-xs text-gray-500 mt-1">ID: ${skillId}</p>
                            </div>
                            <button onclick="cycleSkillState('${levelKey}', '${studentId}', '${skillId}')"
                                class="px-3 py-1 rounded font-semibold text-sm whitespace-nowrap cursor-pointer transition hover:shadow-md"
                                id="skill-btn-${skillId}"
                                data-state="${currentState}"
                                data-skill-id="${skillId}">
                                ${emoji} ${displayState}
                            </button>
                        </div>
                    </div>
                `;
            });
        }

        checklistContainer.innerHTML = html;

        // Apply color styling to all skill buttons
        const getAllSkills = () => {
            const skills = [];
            if (skillsData.sections && Array.isArray(skillsData.sections)) {
                skillsData.sections.forEach(section => {
                    skills.push(...section.competencies);
                });
            } else if (skillsData.competencies && Array.isArray(skillsData.competencies)) {
                skills.push(...skillsData.competencies);
            }
            return skills;
        };

        getAllSkills().forEach(competency => {
            const skillId = competency.id;
            const btn = document.getElementById(`skill-btn-${skillId}`);
            if (btn) {
                const state = btn.dataset.state;
                btn.classList.remove('bg-blue-100', 'text-blue-700', 'bg-red-100', 'text-red-700', 'bg-yellow-100', 'text-yellow-700', 'bg-green-100', 'text-green-700');

                if (state === 'not_assessed') {
                    btn.classList.add('bg-blue-100', 'text-blue-700');
                } else if (state === 'not_demonstrated') {
                    btn.classList.add('bg-red-100', 'text-red-700');
                } else if (state === 'partially_achieved') {
                    btn.classList.add('bg-yellow-100', 'text-yellow-700');
                } else if (state === 'achieved') {
                    btn.classList.add('bg-green-100', 'text-green-700');
                }
            }
        });
    }).catch(err => {
        console.error('Error loading skills checklist:', err);
        checklistContainer.innerHTML = `<p class="text-red-600">Error loading checklist: ${err.message}</p>`;
    });
}

// Toggle section collapse/expand
window.toggleSection = function(sectionId, levelKey) {
    const section = document.getElementById(sectionId);
    const toggle = document.getElementById(`${sectionId}-toggle`);

    if (section) {
        const isCurrentlyHidden = section.classList.contains('hidden');

        if (isCurrentlyHidden) {
            // Expanding
            section.classList.remove('hidden');
            if (toggle) toggle.textContent = '▼';
            localStorage.setItem(`${levelKey}-${sectionId}-expanded`, 'true');
        } else {
            // Collapsing
            section.classList.add('hidden');
            if (toggle) toggle.textContent = '▶️';
            localStorage.removeItem(`${levelKey}-${sectionId}-expanded`);
        }
    }
}

// Cycle through assessment states for a skill
window.cycleSkillState = function(levelKey, studentId, skillId) {
    const btn = document.getElementById(`skill-btn-${skillId}`);
    if (!btn) return;

    const currentState = btn.dataset.state || 'not_assessed';

    // Cycle: not_assessed → not_demonstrated → partially_achieved → achieved → not_assessed
    const stateOrder = ['not_assessed', 'not_demonstrated', 'partially_achieved', 'achieved'];
    const currentIndex = stateOrder.indexOf(currentState);
    const nextIndex = (currentIndex + 1) % stateOrder.length;
    const nextState = stateOrder[nextIndex];

    // Update button display
    const displayState = SKILL_ASSESSMENT_STATES[nextState];
    const stateEmojis = {
        'not_assessed': '🔵',
        'not_demonstrated': '❌',
        'partially_achieved': '⚠️',
        'achieved': '✅'
    };

    btn.textContent = `${stateEmojis[nextState]} ${displayState}`;
    btn.dataset.state = nextState;

    // Update button colors
    btn.classList.remove('bg-blue-100', 'text-blue-700', 'bg-red-100', 'text-red-700', 'bg-yellow-100', 'text-yellow-700', 'bg-green-100', 'text-green-700');
    if (nextState === 'not_assessed') {
        btn.classList.add('bg-blue-100', 'text-blue-700');
    } else if (nextState === 'not_demonstrated') {
        btn.classList.add('bg-red-100', 'text-red-700');
    } else if (nextState === 'partially_achieved') {
        btn.classList.add('bg-yellow-100', 'text-yellow-700');
    } else if (nextState === 'achieved') {
        btn.classList.add('bg-green-100', 'text-green-700');
    }
};

function saveStudentSkills() {
    const levelSelect = document.getElementById('notes-level-select');
    const studentSelect = document.getElementById('notes-student-select');
    const checklistContainer = document.getElementById('skills-checklist-container');

    if (!levelSelect || !studentSelect || !checklistContainer) return;

    const level = levelSelect.value;
    const studentId = studentSelect.value;

    if (!level || !studentId) {
        alert('Please select level and student');
        return;
    }

    // Collect all current skill states from the buttons
    const skillsData = {};
    const buttons = checklistContainer.querySelectorAll('button[id^="skill-btn-"]');
    buttons.forEach(btn => {
        const skillId = btn.dataset.skillId;
        const state = btn.dataset.state || 'not_assessed';
        if (skillId) {
            skillsData[skillId] = state;
        }
    });

    // Save to database
    const skillsPath = `studentNotes/${level}/${studentId}/skillsChecklist`;
    db.ref(skillsPath).set(skillsData).then(() => {
        alert('Skills progress saved!');
    }).catch(err => {
        alert('Error saving skills: ' + err.message);
    });
}

// Build report card HTML (shared by print and email)
function buildReportCardHtml(levelKey, studentId, studentName) {
    const checklistContainer = document.getElementById('skills-checklist-container');
    const skillsData = SAILING_SKILLS[levelKey];
    if (!checklistContainer || !skillsData) {
        return Promise.reject(new Error('Missing skills data or checklist container'));
    }

    // Collect current states from buttons
    const states = {};
    const buttons = checklistContainer.querySelectorAll('button[id^="skill-btn-"]');
    buttons.forEach(btn => {
        const skillId = btn.dataset.skillId;
        states[skillId] = btn.dataset.state || 'not_assessed';
    });

    // Fetch student notes for the report card
    const notesPath = `studentNotes/${levelKey}/${studentId}`;

    return db.ref(notesPath).once('value').then(notesSnap => {
        const notesData = notesSnap.val();
        const notes = [];
        if (notesData) {
            Object.keys(notesData).forEach(noteId => {
                if (noteId === 'skillsChecklist' || noteId === 'notes') return;
                const note = notesData[noteId];
                if (note && note.text && Number.isFinite(note.timestamp)) {
                    note.id = noteId;
                    notes.push(note);
                }
            });
            notes.sort((a, b) => b.timestamp - a.timestamp);
        }

        // Build HTML for print/email
        let html = `
            <!DOCTYPE html>
            <html>
            <head>
                <title>Skills Report Card - ${escapeHtml(studentName)}</title>
                <style>
                    @media print {
                        @page { margin: 1cm; }
                        body { margin: 0; }
                    }
                    body { font-family: 'Segoe UI', Arial, sans-serif; margin: 20px; max-width: 900px; }
                    .header-box { border: 3px solid #1e3a8a; padding: 20px; margin-bottom: 20px; background: linear-gradient(to bottom, #f0f9ff 0%, #ffffff 100%); }
                    h1 { color: #1e3a8a; margin: 0; font-size: 28px; }
                    .student-info { display: flex; justify-content: space-between; margin-top: 10px; }
                    .student-info div { font-size: 14px; }
                    h2 { color: #16a34a; margin-top: 25px; border-bottom: 2px solid #16a34a; padding-bottom: 5px; }
                    h3 { color: #1e40af; margin-top: 15px; background-color: #dbeafe; padding: 8px; border-left: 4px solid #1e3a8a; }
                    table { width: 100%; border-collapse: collapse; margin-top: 10px; margin-bottom: 20px; }
                    th, td { border: 1px solid #ddd; padding: 10px; text-align: left; font-size: 13px; }
                    th { background-color: #f3f4f6; font-weight: bold; }
                    .achieved { background-color: #dcfce7; font-weight: 500; }
                    .partially { background-color: #fef3c7; }
                    .not-demonstrated { background-color: #fee2e2; }
                    .not-assessed { background-color: #f0f9ff; }
                    .notes-section { border: 2px solid #94a3b8; padding: 15px; margin-top: 25px; background-color: #f8fafc; page-break-inside: avoid; }
                    .notes-section h2 { color: #475569; margin-top: 0; }
                    .note-item { background-color: white; border-left: 4px solid #3b82f6; padding: 12px; margin-bottom: 12px; box-shadow: 0 1px 3px rgba(0,0,0,0.1); }
                    .note-meta { color: #64748b; font-size: 11px; margin-bottom: 6px; display: flex; justify-content: space-between; }
                    .note-text { color: #1e293b; line-height: 1.6; font-size: 13px; }
                    .footer { margin-top: 30px; padding-top: 15px; border-top: 1px solid #ddd; font-size: 11px; color: #666; text-align: center; }
                    .summary-stats { display: flex; gap: 15px; margin-top: 15px; flex-wrap: wrap; }
                    .stat-box { padding: 10px 15px; border-radius: 4px; flex: 1; min-width: 120px; text-align: center; }
                    .stat-label { font-size: 11px; color: #666; }
                    .stat-value { font-size: 20px; font-weight: bold; margin-top: 5px; }
                </style>
            </head>
            <body>
                <div class="header-box">
                    <h1>⛵ Sailing Skills Report Card</h1>
                    <div class="student-info">
                        <div><strong>Student:</strong> ${escapeHtml(studentName)}</div>
                        <div><strong>Level:</strong> ${escapeHtml(skillsData.level)}</div>
                        <div><strong>Report Date:</strong> ${new Date().toLocaleDateString('en-IE', { day: 'numeric', month: 'long', year: 'numeric' })}</div>
                    </div>
                </div>

                <h2>📊 Skills Assessment Summary</h2>
        `;

        // Calculate statistics
        const statsCount = {
            achieved: 0,
            partially_achieved: 0,
            not_demonstrated: 0,
            not_assessed: 0,
            total: 0
        };

        Object.values(states).forEach(state => {
            statsCount[state]++;
            statsCount.total++;
        });

        const achievedPercent = statsCount.total > 0 ? Math.round((statsCount.achieved / statsCount.total) * 100) : 0;

        html += `
            <div class="summary-stats">
                <div class="stat-box achieved">
                    <div class="stat-label">Achieved</div>
                    <div class="stat-value">${statsCount.achieved}</div>
                </div>
                <div class="stat-box partially">
                    <div class="stat-label">Partially Achieved</div>
                    <div class="stat-value">${statsCount.partially_achieved}</div>
                </div>
                <div class="stat-box not-demonstrated">
                    <div class="stat-label">Not Demonstrated</div>
                    <div class="stat-value">${statsCount.not_demonstrated}</div>
                </div>
                <div class="stat-box not-assessed">
                    <div class="stat-label">Not Yet Assessed</div>
                    <div class="stat-value">${statsCount.not_assessed}</div>
                </div>
            </div>
            <p style="text-align: center; font-size: 16px; margin-top: 15px;">
                <strong>Overall Progress: ${achievedPercent}%</strong> (${statsCount.achieved}/${statsCount.total} skills achieved)
            </p>
        `;

        // Check if this level has sections or flat competencies
        if (skillsData.sections && Array.isArray(skillsData.sections)) {
            skillsData.sections.forEach(section => {
                html += `<h3>${escapeHtml(section.name)}</h3>
                    <table>
                        <tr>
                            <th>Skill</th>
                            <th>Assessment State</th>
                        </tr>
                `;

                section.competencies.forEach(competency => {
                    const skillId = competency.id;
                    const state = states[skillId] || 'not_assessed';
                    const displayState = SKILL_ASSESSMENT_STATES[state];
                    const rowClass = state === 'achieved' ? 'achieved' :
                                    state === 'partially_achieved' ? 'partially' :
                                    state === 'not_demonstrated' ? 'not-demonstrated' : 'not-assessed';

                    html += `
                        <tr class="${rowClass}">
                            <td>${escapeHtml(competency.skill)}</td>
                            <td><strong>${displayState}</strong></td>
                        </tr>
                    `;
                });

                html += `</table>`;
            });
        } else if (skillsData.competencies && Array.isArray(skillsData.competencies)) {
            html += `
                <table>
                    <tr>
                        <th>Skill</th>
                        <th>Assessment State</th>
                    </tr>
            `;

            skillsData.competencies.forEach(competency => {
                const skillId = competency.id;
                const state = states[skillId] || 'not_assessed';
                const displayState = SKILL_ASSESSMENT_STATES[state];
                const rowClass = state === 'achieved' ? 'achieved' :
                                state === 'partially_achieved' ? 'partially' :
                                state === 'not_demonstrated' ? 'not-demonstrated' : 'not-assessed';

                html += `
                    <tr class="${rowClass}">
                        <td>${escapeHtml(competency.skill)}</td>
                        <td><strong>${displayState}</strong></td>
                    </tr>
                `;
            });

            html += `</table>`;
        }

        // Add instructor notes section
        if (notes.length > 0) {
            html += `
                <div class="notes-section">
                    <h2>📝 Instructor Comments & Notes</h2>
            `;

            notes.forEach(note => {
                const noteDate = new Date(note.timestamp).toLocaleDateString('en-IE', {
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                });
                const editedTag = note.editedAt ? ' <em>(edited)</em>' : '';

                html += `
                    <div class="note-item">
                        <div class="note-meta">
                            <span><strong>${escapeHtml(note.author || 'Instructor')}</strong></span>
                            <span>${noteDate}${editedTag}</span>
                        </div>
                        <div class="note-text">${escapeHtml(note.text)}</div>
                    </div>
                `;
            });

            html += `
                </div>
            `;
        } else {
            html += `
                <div class="notes-section">
                    <h2>📝 Instructor Comments & Notes</h2>
                    <p style="color: #64748b; font-style: italic;">No instructor notes recorded yet.</p>
                </div>
            `;
        }

        html += `
                <div class="footer">
                    <p>Generated by Rathmullan Sailing School Instructor System</p>
                    <p>© ${new Date().getFullYear()} Rathmullan Sailing School</p>
                </div>
            </body>
            </html>
        `;

        return html;
    });
}

function printStudentSkills() {
    const levelSelect = document.getElementById('notes-level-select');
    const studentSelect = document.getElementById('notes-student-select');
    if (!levelSelect || !studentSelect) return;

    const levelKey = levelSelect.value;
    const studentId = studentSelect.value;
    const studentName = studentSelect.options[studentSelect.selectedIndex].text;

    buildReportCardHtml(levelKey, studentId, studentName)
        .then(printHtml => {
            const printWindow = window.open('', '', 'height=600,width=800');
            printWindow.document.write(printHtml);
            printWindow.document.close();
            printWindow.print();
        })
        .catch(err => {
            console.error('Error loading notes for print:', err);
            alert('Error loading notes for report card: ' + err.message);
        });
}

// Email the report card via Google Apps Script (free, uses Gmail)
function emailReportCard() {
    console.log('emailReportCard called');
    const levelSelect = document.getElementById('notes-level-select');
    const studentSelect = document.getElementById('notes-student-select');
    if (!levelSelect || !studentSelect) {
        alert('Could not find level or student select elements');
        return;
    }

    const levelKey = levelSelect.value;
    const studentId = studentSelect.value;
    const studentName = studentSelect.options[studentSelect.selectedIndex].text;

    console.log('Selected:', levelKey, studentId, studentName);

    const recipient = prompt('Enter parent/student email address:');
    if (!recipient || !/^\S+@\S+\.\S+$/.test(recipient.trim())) {
        alert('Please enter a valid email address.');
        return;
    }

    console.log('Building report card HTML...');
    buildReportCardHtml(levelKey, studentId, studentName)
        .then(reportHtml => {
            console.log('Report card HTML built, sending...');
            // Use Google Apps Script to send email (free, no Blaze plan needed)
            const appsScriptUrl = 'https://script.google.com/macros/s/AKfycbxP5XpLshqbGReDyo9PN9WKbcL8B1XZmQJ9KEBGfH82jWv339hSe_maI4slAgMMzc04ng/exec';

            const payload = {
                type: 'report_card_email',
                payload: {
                    to: recipient.trim(),
                    studentEmail: recipient.trim(),
                    subject: `Sailing Skills Report Card - ${studentName}`,
                    studentName,
                    level: SAILING_SKILLS[levelKey]?.level || levelKey,
                    html: reportHtml
                }
            };

            console.log('Fetching with payload:', payload);
            // Send via Apps Script Web App
            return fetch(appsScriptUrl, {
                method: 'POST',
                body: JSON.stringify(payload),
                headers: { 'Content-Type': 'application/json' },
                mode: 'no-cors'
            });
        })
        .then(res => {
            // With no-cors mode, we can't read the response, but the email will still be sent
            console.log('Email request sent to Apps Script');
            alert('Report card sent to ' + recipient + '. Check your email shortly.');
        })
        .catch(err => {
            console.error('Error sending report card:', err);
            alert('Failed to send report card: ' + (err.message || 'Unknown error'));
        });
}

window.cycleSkillState = window.cycleSkillState || cycleSkillState;
window.switchStudentTab = switchStudentTab;
window.loadStudentSkillsChecklist = loadStudentSkillsChecklist;
window.saveStudentSkills = saveStudentSkills;
window.printStudentSkills = printStudentSkills;
window.emailReportCard = emailReportCard;

// Edit a student note at absolute DB path
window.editStudentNoteAtPath = function (notePath) {
    const noteRef = db.ref(notePath);
    noteRef.once('value').then(snap => {
        const note = snap.val();
        if (!note) return;
        const user = auth.currentUser;
        const myUid = user ? user.uid : null;
        const canEdit = !!myUid && (note.authorId ? note.authorId === myUid : (note.author === (currentUserName || (user && user.email ? user.email.split('@')[0] : ''))));
        if (!canEdit) {
            alert('Only the author can edit this note.');
            return;
        }
        const newText = prompt('Edit note:', note.text || '');
        if (newText === null) return;
        const trimmed = newText.trim();
        if (!trimmed) {
            alert('Note cannot be empty.');
            return;
        }
        return noteRef.update({ text: trimmed, editedAt: Date.now() });
    }).then(() => {
        loadStudentNotes();
    }).catch(() => { });
};

// Delete a student note at absolute DB path
window.deleteStudentNoteAtPath = function (notePath) {
    const noteRef = db.ref(notePath);
    noteRef.once('value').then(snap => {
        const note = snap.val();
        if (!note) return;
        const user = auth.currentUser;
        const myUid = user ? user.uid : null;
        const canDelete = !!myUid && (note.authorId ? note.authorId === myUid : (note.author === (currentUserName || (user && user.email ? user.email.split('@')[0] : ''))));
        if (!canDelete) {
            alert('Only the author can delete this note.');
            return Promise.reject();
        }
        if (!confirm('Delete this note? This cannot be undone.')) return Promise.reject();
        return noteRef.remove();
    }).then(() => {
        loadStudentNotes();
    }).catch(() => { });
};

// --- WEEKLY PLAN TEMPLATES ---
function saveWeekTemplate() {
    const nameInput = document.getElementById('template-name-input');
    const name = nameInput ? nameInput.value.trim() : '';

    if (!name) {
        alert('Please enter a template name');
        return;
    }

    // Get all current weekly plan data (robustly)
    const templateData = {};
    const promises = [];
    weeklyLevels.forEach(level => {
        templateData[level] = {};
        days.forEach(day => {
            templateData[level][day] = {};
            slots.forEach(slot => {
                const key = weeklyPlanKey(level, day, slot);
                const p = db.ref(key).once('value').then(snap => {
                    templateData[level][day][slot] = snap.val() || [];
                });
                promises.push(p);
            });
        });
    });

    Promise.all(promises).then(() => {
        return db.ref('weeklyTemplates').push({
            name,
            data: templateData,
            timestamp: Date.now()
        });
    }).then(() => {
        alert('Template saved!');
        if (nameInput) nameInput.value = '';
        loadTemplatesList();
    }).catch(err => alert('Error: ' + err.message));
}

function loadTemplatesList() {
    const select = document.getElementById('template-select');
    if (!select) return;

    db.ref('weeklyTemplates').once('value').then(snap => {
        select.innerHTML = '<option value="">Select a template...</option>';
        snap.forEach(child => {
            const template = child.val();
            const option = document.createElement('option');
            option.value = child.key;
            option.textContent = template.name;
            select.appendChild(option);
        });
    });
}

function loadWeekTemplate() {
    const select = document.getElementById('template-select');
    const templateId = select ? select.value : '';

    if (!templateId) {
        alert('Please select a template');
        return;
    }

    if (!confirm('This will replace the current weekly plan. Continue?')) return;

    db.ref('weeklyTemplates/' + templateId).once('value').then(snap => {
        const template = snap.val();
        if (!template) {
            alert('Template not found');
            return;
        }

        // Support legacy templates without a top-level `data` key
        const data = template.data || template;
        const hasShape = weeklyLevels.every(level => data[level]);
        if (!hasShape) {
            alert('Template not found');
            return;
        }

        // Load template data into weekly plan
        const writes = [];
        weeklyLevels.forEach(level => {
            days.forEach(day => {
                slots.forEach(slot => {
                    const activities = (data[level] && data[level][day] && data[level][day][slot]) ? data[level][day][slot] : [];
                    const key = weeklyPlanKey(level, day, slot);
                    writes.push(db.ref(key).set(activities));
                });
            });
        });

        return Promise.all(writes).then(() => {
            loadWeeklyPlans();
            alert('Template loaded!');
        });
    }).catch(err => alert('Error: ' + err.message));
}

function deleteWeekTemplate() {
    const select = document.getElementById('template-select');
    const templateId = select ? select.value : '';

    if (!templateId) {
        alert('Please select a template to delete');
        return;
    }

    if (!confirm('Delete this template? This cannot be undone.')) return;

    db.ref('weeklyTemplates/' + templateId).remove().then(() => {
        alert('Template deleted');
        loadTemplatesList();
    });
}

window.saveWeekTemplate = saveWeekTemplate;
window.loadWeekTemplate = loadWeekTemplate;
window.deleteWeekTemplate = deleteWeekTemplate;

// --- PRINT VIEW ---
function openPrintView() {
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
        alert('Please allow popups to print');
        return;
    }

    // Collect all weekly plan data
    let printContent = '<html><head><title>Weekly Plan - Print View</title>';
    printContent += '<style>body{font-family:Arial,sans-serif;padding:20px}table{width:100%;border-collapse:collapse;margin-bottom:30px}th,td{border:1px solid #ddd;padding:8px;text-align:left}th{background:#4299e1;color:white}h1{color:#2c5282}h2{color:#4299e1;margin-top:20px}.activity{background:#ebf8ff;padding:4px 8px;margin:2px 0;border-radius:4px}@media print{body{padding:10px}}</style>';
    printContent += '</head><body>';
    printContent += '<h1>Rathmullan Sailing School - Weekly Plan</h1>';
    printContent += '<p><strong>Generated:</strong> ' + new Date().toLocaleString() + '</p>';

    weeklyLevels.forEach(level => {
        printContent += '<h2>' + level.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ') + '</h2>';
        printContent += '<table><thead><tr><th>Time</th>';
        days.forEach(day => {
            printContent += '<th>' + day.toUpperCase() + '</th>';
        });
        printContent += '</tr></thead><tbody>';

        slots.forEach(slot => {
            printContent += '<tr><td><strong>' + slot.toUpperCase() + '</strong></td>';
            days.forEach(day => {
                printContent += '<td>';
                const cell = document.querySelector(`.weekly-slot[data-level="${level}"][data-day="${day}"][data-slot="${slot}"]`);
                if (cell) {
                    const activities = cell.querySelectorAll('.weekly-activity');
                    activities.forEach(act => {
                        printContent += '<div class="activity">' + escapeHtml(act.textContent) + '</div>';
                    });
                }
                printContent += '</td>';
            });
            printContent += '</tr>';
        });
        printContent += '</tbody></table>';
    });

    printContent += '</body></html>';
    printWindow.document.write(printContent);
    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => printWindow.print(), 500);
}

window.openPrintView = openPrintView;

// ==============================
// AI PLAN ASSISTANT (Gemini)
// ==============================
function getGeminiApiKey() {
    // Deprecated: API key is managed on the server via proxy
    return '';
}

async function callGemini(systemPrompt, userQuery, model = 'gemini-2.5-flash-preview-09-2025') {
    const res = await fetch('/api/gemini/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ systemPrompt, userQuery, model })
    });
    if (!res.ok) {
        const t = await res.text();
        throw new Error(`Gemini proxy ${res.status}: ${t}`);
    }
    const data = await res.json();
    const text = data && data.text ? data.text : '';
    if (!text) throw new Error('Empty Gemini response');
    return text;
}

function extractJson(text) {
    const fence = text.match(/```json[\s\S]*?```/i);
    if (fence) {
        const inner = fence[0].replace(/```json/i, '').replace(/```/, '');
        try { return JSON.parse(inner); } catch { }
    }
    const start = text.indexOf('{');
    const end = text.lastIndexOf('}');
    if (start !== -1 && end !== -1 && end > start) {
        const maybe = text.slice(start, end + 1);
        try { return JSON.parse(maybe); } catch { }
    }
    return null;
}

async function aiSuggestWeeklyPlan() {
    const out = document.getElementById('ai-plan-output');
    if (out) out.textContent = 'Thinking... Fetching context and generating a plan...';
    try {
        const studentsSnap = await db.ref('students').once('value');
        const students = studentsSnap.val() || {};
        const weather = null; // Windy summaries removed from instructors page
        const studentCounts = weeklyLevels.map(l => `${l}: ${(students[l] || []).length} students`).join('; ');
        const wx = weather && weather.current ? `Wind ${weather.current.wind?.knots || '?'} kts (${weather.current.wind?.bft || '?'} Bft), dir ${weather.current.wind?.dir || '?'}, gust ${weather.current.wind?.gustKnots || '?'} kts` : 'No weather data';
        const systemPrompt = 'You are a senior sailing instructor. Create a 5-day plan (Mon–Fri) for multiple levels with AM and PM slots. Be pragmatic for real teaching, consider numbers and weather. Output strict JSON only.';
        const userQuery = `Levels: ${weeklyLevels.join(', ')}\nStudent counts: ${studentCounts}\nWeather summary: ${wx}\nReturn JSON with shape { "${weeklyLevels[0]}": { "mon": { "am": ["..."], "pm": ["..."] }, ... }, ... } for all levels/days/slots. Activities should be short imperative phrases. Avoid explanations.`;
        const reply = await callGemini(systemPrompt, userQuery);
        const json = extractJson(reply);
        if (!json) throw new Error('Could not parse JSON from model response');
        const writes = [];
        weeklyLevels.forEach(level => {
            days.forEach(day => {
                slots.forEach(slot => {
                    const activities = (json[level] && json[level][day] && json[level][day][slot]) ? json[level][day][slot] : [];
                    const key = weeklyPlanKey(level, day, slot);
                    writes.push(db.ref(key).set(activities.map(t => ({ id: uuidv4(), text: String(t) }))));
                });
            });
        });
        await Promise.all(writes);
        loadWeeklyPlans();
        if (out) out.textContent = 'AI plan applied to weekly schedule.';
    } catch (err) {
        if (out) out.textContent = 'AI error: ' + err.message;
        alert('AI error: ' + err.message);
    }
}

async function aiGenerateRiskBriefing() {
    const out = document.getElementById('ai-risk-output');
    if (out) out.textContent = 'Generating risk briefing...';
    try {
        const weather = null; // Windy summaries removed from instructors page
        const wx = weather && weather.current ? `Wind ${weather.current.wind?.knots || '?'} kts (${weather.current.wind?.bft || '?'} Bft), dir ${weather.current.wind?.dir || '?'}, gust ${weather.current.wind?.gustKnots || '?'} kts; temp ${weather.current.tempC || '?'}C; rh ${weather.current.rh || '?'}%` : 'No weather data';
        const systemPrompt = 'You are a concise water safety lead. Produce a DICE briefing (Define area, Identify hazards, Communication, Escape) for dinghy instruction. Keep bullet points, concrete actions, 6-10 bullets total.';
        const userQuery = `Conditions: ${wx}. Course: multi-level youth dinghy at Rathmullan. Output: plain text bullets (no JSON).`;
        const reply = await callGemini(systemPrompt, userQuery);
        if (out) out.innerText = reply;
    } catch (err) {
        if (out) out.textContent = 'AI error: ' + err.message;
        alert('AI error: ' + err.message);
    }
}

function clearAllWeeklyActivities() {
    if (!confirm('Clear ALL weekly activities for all levels? This cannot be undone.')) return;

    const updates = {};
    weeklyLevels.forEach(level => {
        days.forEach(day => {
            slots.forEach(slot => {
                const key = weeklyPlanKey(level, day, slot);
                updates[key] = [];
            });
        });
    });

    db.ref().update(updates).then(() => {
        loadWeeklyPlans();
        alert('All weekly activities cleared.');
    }).catch(err => {
        alert('Error clearing activities: ' + err.message);
    });
}

// --- ENHANCED CHAT FEATURES ---
let currentChatView = 'general';
let selectedPrivateRecipient = null;

// Private messages realtime helpers
const privateMessagesRef = db.ref('privateMessages');
let _privateHandlersAttachedFor = null;
const _privateHandlers = { child_added: null, child_changed: null, child_removed: null };

function toggleChatView(view) {
    currentChatView = view;

    // Update button styles
    ['general', 'gallery', 'private'].forEach(v => {
        const btn = document.getElementById(`chat-view-${v}`);
        if (btn) {
            if (v === view) {
                btn.className = 'bg-blue-600 text-white px-3 py-1 rounded text-sm';
            } else {
                btn.className = 'bg-gray-300 text-gray-700 px-3 py-1 rounded text-sm';
            }
        }
    });

    // Show/hide content
    document.getElementById('chat-view-general-content')?.classList.toggle('hidden', view !== 'general');
    document.getElementById('chat-view-gallery-content')?.classList.toggle('hidden', view !== 'gallery');
    document.getElementById('chat-view-private-content')?.classList.toggle('hidden', view !== 'private');

    if (view === 'gallery') {
        loadChatGallery();
    } else if (view === 'private') {
        loadPrivateInstructorsList();
    }
}

function loadChatGallery() {
    const gallery = document.getElementById('chat-gallery');
    if (!gallery) return;

    db.ref('chat/messages').orderByChild('mediaUrl').once('value').then(snap => {
        gallery.innerHTML = '';
        let count = 0;
        const user = auth.currentUser;
        snap.forEach(child => {
            const msg = child.val();
            if (msg.mediaUrl && msg.mediaType === 'image') {
                const isOwner = user && msg.userId === user.uid;
                const div = document.createElement('div');
                div.className = 'relative group cursor-pointer';
                const deleteBtn = isOwner ? `<button onclick="event.stopPropagation(); deleteChatMessage('${child.key}')" class="absolute top-2 right-2 bg-red-600 text-white px-2 py-1 rounded text-xs opacity-0 group-hover:opacity-100 hover:bg-red-700 z-10">Delete</button>` : '';
                div.innerHTML = `
                    ${deleteBtn}
                    <img src="${escapeHtml(msg.mediaUrl)}" class="w-full h-32 object-cover rounded-lg" alt="Shared image">
                    <div class="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition rounded-lg flex items-center justify-center pointer-events-none">
                        <span class="text-white text-xs opacity-0 group-hover:opacity-100">${escapeHtml(msg.name)}</span>
                    </div>
                `;
                div.querySelector('img')?.addEventListener('click', (e) => {
                    e.stopPropagation();
                    showImageModal(msg.mediaUrl, msg.name);
                });
                gallery.appendChild(div);
                count++;
            }
        });
        if (count === 0) {
            gallery.innerHTML = '<div class="col-span-full text-center text-gray-500 py-8">No photos shared yet</div>';
        }
    });
}

// Show image in modal
function showImageModal(imageUrl, authorName) {
    // Create modal
    const modal = document.createElement('div');
    modal.className = 'fixed inset-0 bg-black bg-opacity-90 z-50 flex items-center justify-center p-4';
    modal.onclick = () => modal.remove();

    modal.innerHTML = `
        <div class="relative max-w-4xl max-h-full">
            <button onclick="this.closest('.fixed').remove()" class="absolute -top-10 right-0 text-white text-2xl hover:text-gray-300">&times;</button>
            <img src="${escapeHtml(imageUrl)}" class="max-w-full max-h-[90vh] rounded-lg" alt="Full size image">
            <p class="text-white text-center mt-2 text-sm">Shared by ${escapeHtml(authorName || 'Instructor')}</p>
        </div>
    `;

    document.body.appendChild(modal);
}

function loadPrivateInstructorsList() {
    const list = document.getElementById('private-instructors-list');
    if (!list) return;

    db.ref('users').once('value').then(snap => {
        list.innerHTML = '';
        const user = auth.currentUser;
        snap.forEach(child => {
            const userData = child.val();
            if (userData.approved && child.key !== user?.uid) {
                const div = document.createElement('div');
                div.className = 'p-3 hover:bg-blue-50 cursor-pointer text-sm';
                div.textContent = userData.name || userData.email.split('@')[0];
                div.onclick = () => selectPrivateRecipient(child.key, userData.name || userData.email.split('@')[0]);
                list.appendChild(div);
            }
        });
    });
}

function selectPrivateRecipient(recipientId, recipientName) {
    selectedPrivateRecipient = recipientId;
    const header = document.getElementById('private-chat-header');
    const form = document.getElementById('private-chat-form');
    const messagesDiv = document.getElementById('private-messages');

    if (header) header.textContent = `Chat with ${recipientName}`;
    if (form) form.classList.remove('hidden');
    if (messagesDiv) attachPrivateListeners(recipientId);
}

function loadPrivateMessages(recipientId) {
    // Backwards-compatible alias: attach realtime listeners and populate initial messages
    attachPrivateListeners(recipientId);
}

function attachPrivateListeners(recipientId) {
    const messagesDiv = document.getElementById('private-messages');
    if (!messagesDiv) return;
    const user = auth.currentUser;
    if (!user) return;

    // If already attached for this recipient, do nothing
    if (_privateHandlersAttachedFor === recipientId) return;

    // Detach any existing handlers
    try { privateMessagesRef.off(); } catch (e) {}

    _privateHandlers.child_added = function (snap) {
        const msg = snap.val();
        const sender = msg.senderId || msg.from;
        const recipient = msg.recipientId || msg.to;
        if ((sender === user.uid && recipient === recipientId) || (sender === recipientId && recipient === user.uid)) {
            appendPrivateMessage(snap.key, msg, recipientId);
        }
    };

    _privateHandlers.child_changed = function (snap) {
        const msg = snap.val();
        const sender = msg.senderId || msg.from;
        const recipient = msg.recipientId || msg.to;
        if ((sender === user.uid && recipient === recipientId) || (sender === recipientId && recipient === user.uid)) {
            updatePrivateMessageUI(snap.key, msg);
        }
    };

    _privateHandlers.child_removed = function (snap) {
        removePrivateMessageUI(snap.key);
    };

    privateMessagesRef.on('child_added', _privateHandlers.child_added);
    privateMessagesRef.on('child_changed', _privateHandlers.child_changed);
    privateMessagesRef.on('child_removed', _privateHandlers.child_removed);

    // Clear and populate existing messages once
    messagesDiv.innerHTML = '';
    privateMessagesRef.orderByChild('timestamp').once('value').then(snap => {
        snap.forEach(child => {
            const msg = child.val();
            const sender = msg.senderId || msg.from;
            const recipient = msg.recipientId || msg.to;
            if ((sender === user.uid && recipient === recipientId) || (sender === recipientId && recipient === user.uid)) {
                appendPrivateMessage(child.key, msg, recipientId);
            }
        });
        messagesDiv.scrollTop = messagesDiv.scrollHeight;
    });

    _privateHandlersAttachedFor = recipientId;
}

function appendPrivateMessage(msgId, msg, recipientId) {
    const messagesDiv = document.getElementById('private-messages');
    if (!messagesDiv) return;
    if (messagesDiv.querySelector(`[data-msg-id="${msgId}"]`)) return; // avoid duplicates

    const user = auth.currentUser;
    const sender = msg.senderId || msg.from;
    const isSent = sender === user.uid;
    const timestamp = new Date(msg.timestamp);
    const timeStr = timestamp.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false });
    const dateStr = timestamp.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    const editedTag = msg.editedAt ? '<span class="text-[10px] ml-1">(edited)</span>' : '';

    const div = document.createElement('div');
    div.className = `flex ${isSent ? 'justify-end' : 'justify-start'} mb-2 group`;
    div.setAttribute('data-msg-id', msgId);

    const actions = isSent ? `
        <div class="flex gap-1 mt-1">
            <button onclick="editPrivateMessage('${msgId}', '${recipientId}')" class="text-xs px-2 py-0.5 rounded bg-blue-600 text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-300">Edit</button>
            <button onclick="deletePrivateMessage('${msgId}', '${recipientId}')" class="text-xs px-2 py-0.5 rounded bg-red-600 text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-300">Delete</button>
        </div>
    ` : '';

    div.innerHTML = `
        <div class="${isSent ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-800'} rounded-lg px-3 py-2 max-w-xs">
            <p class="text-sm break-words">${escapeHtml(msg.text)}</p>
            <div class="flex items-center justify-between mt-1">
                <span class="text-[10px] opacity-75">${dateStr} ${timeStr}${editedTag}</span>
            </div>
            ${actions}
        </div>
    `;

    messagesDiv.appendChild(div);
    messagesDiv.scrollTop = messagesDiv.scrollHeight;
}

function updatePrivateMessageUI(msgId, msg) {
    const messagesDiv = document.getElementById('private-messages');
    if (!messagesDiv) return;
    const el = messagesDiv.querySelector(`[data-msg-id="${msgId}"]`);
    if (!el) return;
    const timestamp = new Date(msg.timestamp);
    const timeStr = timestamp.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false });
    const dateStr = timestamp.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    const editedTag = msg.editedAt ? '<span class="text-[10px] ml-1">(edited)</span>' : '';
    const bubble = el.querySelector('div');
    if (bubble) {
        bubble.innerHTML = `<p class="text-sm break-words">${escapeHtml(msg.text)}</p><div class="flex items-center justify-between mt-1"><span class="text-[10px] opacity-75">${dateStr} ${timeStr}${editedTag}</span></div>` + (bubble.innerHTML.includes('Edit') || bubble.innerHTML.includes('Delete') ? '' : '');
    }
}

function removePrivateMessageUI(msgId) {
    const messagesDiv = document.getElementById('private-messages');
    if (!messagesDiv) return;
    const el = messagesDiv.querySelector(`[data-msg-id="${msgId}"]`);
    if (el) el.remove();
}

// Private message form handler
document.addEventListener('DOMContentLoaded', () => {
    const privateForm = document.getElementById('private-chat-form');
    if (privateForm) {
        privateForm.addEventListener('submit', e => {
            e.preventDefault();
            const input = document.getElementById('private-chat-input');
            const text = input ? input.value.trim() : '';

            if (!text || !selectedPrivateRecipient) return;

            const user = auth.currentUser;
            db.ref('privateMessages').push({
                // Use explicit fields matching DB rules: senderId / recipientId
                senderId: user.uid,
                recipientId: selectedPrivateRecipient,
                // Preserve legacy names for compatibility
                from: user.uid,
                to: selectedPrivateRecipient,
                text: text.slice(0, 500),
                timestamp: Date.now()
            }).then(() => {
                if (input) input.value = '';
                loadPrivateMessages(selectedPrivateRecipient);
            });
        });
    }
});

window.toggleChatView = toggleChatView;

// Edit private message
window.editPrivateMessage = function (msgId, recipientId) {
    db.ref('privateMessages/' + msgId).once('value').then(snap => {
        const msg = snap.val();
        if (!msg) return;

        const newText = prompt('Edit your message:', msg.text);
        if (newText === null) return; // cancelled
        const trimmed = newText.trim();
        if (!trimmed) {
            alert('Cannot set empty message. Delete instead if you wish.');
            return;
        }

        db.ref('privateMessages/' + msgId).update({
            text: trimmed,
            editedAt: Date.now()
        }).then(() => {
            loadPrivateMessages(recipientId);
        });
    });
};

// Delete private message
window.deletePrivateMessage = function (msgId, recipientId) {
    if (confirm('Delete this private message? This cannot be undone.')) {
        db.ref('privateMessages/' + msgId).remove().then(() => {
            loadPrivateMessages(recipientId);
        });
    }
};

// Wind Chart Control Functions
window.windChartZoomIn = function() {
    if (window.windChartInstance) {
        window.windChartInstance.zoom(1.2);
    }
};

window.windChartZoomOut = function() {
    if (window.windChartInstance) {
        window.windChartInstance.zoom(0.8);
    }
};

window.windChartPanLeft = function() {
    if (window.windChartInstance) {
        const HOUR_MS = 60 * 60 * 1000;
        window.windChartInstance.pan({x: -3 * HOUR_MS}, undefined, 'default');
    }
};

window.windChartPanRight = function() {
    if (window.windChartInstance) {
        const HOUR_MS = 60 * 60 * 1000;
        window.windChartInstance.pan({x: 3 * HOUR_MS}, undefined, 'default');
    }
};

window.windChartReset = function() {
    if (window.windChartInstance) {
        // Reset to original data-range limits (do not call plugin resetZoom to avoid changing plugin internal state)
        try {
            const chart = window.windChartInstance;
            if (chart && chart.options && chart.options.scales && chart.options.scales.x) {
                // Use stored min/max if available, otherwise fall back to initial axis values
                const min = window.windChartMinLimit || chart.options.scales.x.min;
                const max = window.windChartMaxLimit || chart.options.scales.x.max;
                chart.options.scales.x.min = typeof min === 'number' ? min : (min instanceof Date ? min.getTime() : min);
                chart.options.scales.x.max = typeof max === 'number' ? max : (max instanceof Date ? max.getTime() : max);
                chart.update();
            }
        } catch (e) { console.error('windChartReset error', e); }
        const slider = document.getElementById('wind-time-slider');
        if (slider) slider.value = 0;
        const label = document.getElementById('wind-slider-label');
        if (label) label.textContent = 'Now';
    }
};

window.windChartGoToNow = function() {
    if (window.windChartInstance && window.windChartNowTime) {
        try {
            const HOUR_MS = 60 * 60 * 1000;
            const viewRange = 12 * HOUR_MS; // Show +/- 6 hours around now
            const center = window.windChartNowTime;
            const min = center - viewRange / 2;
            const max = center + viewRange / 2;
            const chart = window.windChartInstance;
            if (chart && chart.options && chart.options.scales && chart.options.scales.x) {
                chart.options.scales.x.min = min;
                chart.options.scales.x.max = max;
                chart.update();
            }
        } catch (e) { console.error('windChartGoToNow error', e); }
        const slider = document.getElementById('wind-time-slider');
        if (slider) slider.value = 0;
        const label = document.getElementById('wind-slider-label');
        if (label) label.textContent = 'Now';
    }
};

window.windChartSliderChange = function(value) {
    const hours = parseInt(value);
    const HOUR_MS = 60 * 60 * 1000;
    const label = document.getElementById('wind-slider-label');

    if (hours === 0) {
        if (label) label.textContent = 'Now';
    } else if (hours > 0) {
        if (label) label.textContent = '+' + hours + 'h';
    } else {
        if (label) label.textContent = hours + 'h';
    }

    // Update chart x-axis min/max directly instead of using the zoom plugin
    if (window.windChartInstance && window.windChartNowTime) {
        try {
            const centerTime = window.windChartNowTime + (hours * HOUR_MS);
            const viewRange = 12 * HOUR_MS; // Show +/- 6 hours
            const min = centerTime - viewRange / 2;
            const max = centerTime + viewRange / 2;
            const chart = window.windChartInstance;
            if (chart && chart.options && chart.options.scales && chart.options.scales.x) {
                chart.options.scales.x.min = min;
                chart.options.scales.x.max = max;
                chart.update();
            }
        } catch (e) { console.error('windChartSliderChange error', e); }
    }
};

// ======== NOTIFICATION FUNCTIONS ========

// Show a browser notification (Notification API)
function showNotification(title, options = {}) {
    if (typeof Notification === 'undefined' || Notification.permission !== 'granted') return Promise.reject('No permission');
    return new Notification(title, {
        icon: '/images/logo.png',
        badge: '/images/logo.png',
        ...options
    });
}

// Register device for push notifications via Firebase Messaging
async function registerForPush() {
    if (!messaging || !auth.currentUser) {
        console.warn('[Push] Messaging or user not available');
        return;
    }
    try {
        const token = await messaging.getToken({
            vapidKey: 'BPUS6ZvQdWg8bLQ_N2_YvtVqfXkPuHplV4JvQcS5RrB9zy_s6v_R_zSQSN77TY7oVVtjzRvUiqlpHfPjhqXs0AM'
        });
        if (token) {
            console.log('[Push] Device token obtained:', token.substring(0, 20) + '...');
            // Store token in Firebase
            await db.ref('users/' + auth.currentUser.uid + '/pushToken').set(token);
            console.log('[Push] Token stored in database');
        }
    } catch (error) {
        console.error('[Push] Registration failed:', error);
    }
}

// Handle incoming FCM messages when the app is in foreground
if (messaging) {
    messaging.onMessage((payload) => {
        console.log('[FCM] Message received in foreground:', payload);
        const { notification, data } = payload;
        if (notification && window.notificationPrefs?.enabled) {
            showNotification(notification.title || 'Sailing School', {
                body: notification.body || '',
                tag: data?.type || 'message',
                requireInteraction: data?.type === 'urgent'
            }).catch(e => console.warn('[FCM] Notification show failed:', e));
        }
    });
}

// Handle foreground message arrival for real-time updates
if (messaging) {
    messaging.onBackgroundMessage?.((payload) => {
        console.log('[FCM] Background message:', payload);
        // This runs automatically in the service worker - no manual handling needed
    });
}

// Listen for notification clicks in service worker (if available)
if ('serviceWorker' in navigator && messaging) {
    navigator.serviceWorker.addEventListener('message', (event) => {
        if (event.data?.type === 'notification-click') {
            const data = event.data.data || {};
            console.log('[SW] Notification clicked:', data);
            // You can handle notification clicks here (e.g., navigate to specific page)
            if (data.targetUrl) {
                window.location.href = data.targetUrl;
            }
        }
    });
}
